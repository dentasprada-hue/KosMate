import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { LogOut, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { Screen, SectionHeader } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';

interface OwnerRow {
  user_id: string;
  email: string;
  created_at: string;
  nama_kos: string;
  nama_pemilik: string;
  whatsapp_kos: string;
}

export default function AdminScreen() {
  const { role, loading, roleLoading } = useAuth();
  const { toast } = useToast();
  const [owners, setOwners] = useState<OwnerRow[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<OwnerRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OwnerRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadOwners = async () => {
    const client = supabase();
    if (!client) return;
    try {
      const [uRes, sRes] = await Promise.all([
        client.from('app_users').select('user_id, email, created_at').eq('role', 'owner'),
        client.from('settings').select('id, nama_kos, nama_pemilik, whatsapp_kos'),
      ]);
      if (uRes.error) throw uRes.error;
      if (sRes.error) throw sRes.error;
      const settingsByOwner = new Map((sRes.data ?? []).map((s) => [s.id, s]));
      const rows: OwnerRow[] = (uRes.data ?? []).map((u) => ({
        user_id: u.user_id,
        email: u.email,
        created_at: u.created_at,
        nama_kos: settingsByOwner.get(u.user_id)?.nama_kos ?? '—',
        nama_pemilik: settingsByOwner.get(u.user_id)?.nama_pemilik ?? '',
        whatsapp_kos: settingsByOwner.get(u.user_id)?.whatsapp_kos ?? '',
      }));
      rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      setOwners(rows);
    } catch (e: any) {
      toast(e?.message ?? 'Gagal memuat daftar kos', 'error');
    }
  };

  useEffect(() => {
    if (role === 'admin') loadOwners();
  }, [role]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const client = supabase();
      if (!client) throw new Error('Supabase tidak tersedia');
      const { error } = await client.rpc('admin_delete_owner', { p_user_id: deleteTarget.user_id });
      if (error) throw new Error(error.message);
      toast(`Akun ${deleteTarget.nama_kos} dihapus`, 'success');
      setDeleteTarget(null);
      await loadOwners();
    } catch (e: any) {
      toast(e?.message ?? 'Gagal menghapus akun', 'error');
      setDeleteTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    const client = supabase();
    if (client) await client.auth.signOut();
    router.replace('/(auth)/login');
  };

  if (loading || roleLoading) {
    return (
      <Screen>
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      </Screen>
    );
  }

  if (role !== 'admin') {
    return (
      <Screen>
        <Text style={{ fontFamily: FontFamily.regular, fontSize: 14, color: Colors.mutedForeground, textAlign: 'center', paddingVertical: 40 }}>Halaman ini khusus admin.</Text>
      </Screen>
    );
  }

  return (
    <Screen
      title="Admin"
      subtitle="Kelola akun pemilik kos"
      headerRight={
        <Button size="sm" variant="primary" onPress={() => setShowCreate(true)}>
          <Plus size={14} color="#fff" /> Akun
        </Button>
      }
      contentContainerStyle={{ gap: Spacing.md }}
    >
      {owners === null ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <>
          <SectionHeader title={`Akun Pemilik Kos (${owners.length})`} />
          {owners.length === 0 ? (
            <Text style={{ color: Colors.mutedForeground, fontFamily: FontFamily.regular, fontSize: 14, textAlign: 'center', paddingVertical: 30 }}>
              Belum ada akun pemilik kos. Klik "Akun" untuk membuat.
            </Text>
          ) : (
            <View style={{ gap: Spacing.sm }}>
              {owners.map((o) => (
                <View key={o.user_id} style={{ backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, padding: Spacing.lg, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontFamily: FontFamily.extrabold, fontSize: 17, color: '#FFFFFF' }}>{(o.nama_kos ?? 'K').charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FontFamily.bold, fontSize: 15, color: Colors.foreground }}>{o.nama_kos}</Text>
                      <Text style={{ fontFamily: FontFamily.regular, fontSize: 12.5, color: Colors.mutedForeground }}>{o.nama_pemilik || 'Pemilik'}</Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: FontFamily.regular, fontSize: 13, color: Colors.mutedForeground, marginTop: 6 }}>
                    {o.email} {o.whatsapp_kos ? ` • WA ${o.whatsapp_kos}` : ''}
                  </Text>
                  <Text style={{ fontFamily: FontFamily.regular, fontSize: 11.5, color: Colors.mutedForeground }}>
                    Dibuat {new Date(o.created_at).toLocaleDateString('id-ID')}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginTop: Spacing.sm }}>
                    <Button size="sm" variant="outline" onPress={() => setEditTarget(o)}>
                      <Pencil size={14} color={Colors.primary} /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onPress={() => setDeleteTarget(o)}>
                      <Trash2 size={14} color="#fff" /> Hapus
                    </Button>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <CreateOwnerDialog visible={showCreate} onClose={() => setShowCreate(false)} submitting={submitting} onSubmit={async (values) => {
        setSubmitting(true);
        try {
          const client = supabase();
          if (!client) throw new Error('Supabase tidak tersedia');
          const { error } = await client.rpc('admin_create_owner', {
            p_email: values.email,
            p_password: values.password,
            p_nama_kos: values.nama_kos,
            p_nama_pemilik: values.nama_pemilik,
            p_whatsapp_kos: values.whatsapp_kos,
          });
          if (error) throw new Error(error.message);
          toast(`Akun ${values.nama_kos} dibuat`, 'success');
          setShowCreate(false);
          await loadOwners();
        } catch (e: any) {
          toast(e?.message ?? 'Gagal membuat akun', 'error');
        } finally {
          setSubmitting(false);
        }
      }} />

      <EditOwnerDialog
        visible={!!editTarget}
        owner={editTarget}
        submitting={submitting}
        onClose={() => setEditTarget(null)}
        onSubmit={async (values) => {
          if (!editTarget) return;
          setSubmitting(true);
          try {
            const client = supabase();
            if (!client) throw new Error('Supabase tidak tersedia');
            const { error } = await client.rpc('admin_update_owner', {
              p_user_id: editTarget.user_id,
              p_nama_kos: values.nama_kos,
              p_nama_pemilik: values.nama_pemilik,
              p_whatsapp_kos: values.whatsapp_kos,
            });
            if (error) throw new Error(error.message);
            toast('Data kos diperbarui', 'success');
            setEditTarget(null);
            await loadOwners();
          } catch (e: any) {
            toast(e?.message ?? 'Gagal memperbarui akun', 'error');
          } finally {
            setSubmitting(false);
          }
        }}
      />

      <Dialog
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Akun Pemilik Kos"
        description={deleteTarget ? `Hapus akun ${deleteTarget.nama_kos} (${deleteTarget.email}) beserta seluruh data kamar, penghuni, dan pembayarannya?` : ''}
        footer={
          <>
            <Button variant="outline" onPress={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" loading={submitting} onPress={handleDelete}>Hapus Akun</Button>
          </>
        }
      />

      <View style={{ marginTop: Spacing.lg }}>
        <Button variant="outline" onPress={logout} style={{ alignSelf: 'center' }}>
          <LogOut size={15} color="#BE123C" /> Keluar dari admin
        </Button>
      </View>
    </Screen>
  );
}

interface CreateOwnerDialogProps {
  visible: boolean;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (values: { email: string; password: string; nama_kos: string; nama_pemilik: string; whatsapp_kos: string }) => Promise<void>;
}

function CreateOwnerDialog({ visible, onClose, submitting, onSubmit }: CreateOwnerDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [namaKos, setNamaKos] = useState('');
  const [namaPemilik, setNamaPemilik] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const submit = async () => {
    if (!namaKos || !email || !password) {
      toast('Nama kos, email, dan kata sandi wajib diisi', 'error');
      return;
    }
    if (password.length < 6) {
      toast('Kata sandi minimal 6 karakter', 'error');
      return;
    }
    await onSubmit({ email, password, nama_kos: namaKos, nama_pemilik: namaPemilik, whatsapp_kos: whatsapp });
  };

  const reset = () => {
    setEmail('');
    setPassword('');
    setNamaKos('');
    setNamaPemilik('');
    setWhatsapp('');
  };

  return (
    <Dialog
      visible={visible}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Buat Akun Pemilik Kos"
      description="Akun baru akan langsung bisa login oleh pemilik kos yang bersangkutan."
      footer={
        <>
          <Button variant="outline" onPress={() => { reset(); onClose(); }}>Batal</Button>
          <Button loading={submitting} onPress={submit}>Buat Akun</Button>
        </>
      }
    >
      <ScrollView style={{ maxHeight: 420 }}>
        <FormField label="Nama Kos" required>
          <Input value={namaKos} onChangeText={setNamaKos} placeholder="contoh: Kos Kita" />
        </FormField>
        <FormField label="Nama Pemilik">
          <Input value={namaPemilik} onChangeText={setNamaPemilik} placeholder="contoh: Budi" />
        </FormField>
        <FormField label="WhatsApp Kos">
          <Input value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" placeholder="08xxxxxxxxxx" />
        </FormField>
        <FormField label="Email (login)" required>
          <Input autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="nama@email.com" />
        </FormField>
        <FormField label="Kata Sandi" required hint="Minimal 6 karakter">
          <Input secureTextEntry value={password} onChangeText={setPassword} placeholder="••••••••" />
        </FormField>
      </ScrollView>
    </Dialog>
  );
}

interface EditOwnerDialogProps {
  visible: boolean;
  owner: OwnerRow | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: { nama_kos: string; nama_pemilik: string; whatsapp_kos: string }) => Promise<void>;
}

function EditOwnerDialog({ visible, owner, submitting, onClose, onSubmit }: EditOwnerDialogProps) {
  const { toast } = useToast();
  const [namaKos, setNamaKos] = useState('');
  const [namaPemilik, setNamaPemilik] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    setNamaKos(owner?.nama_kos ?? '');
    setNamaPemilik(owner?.nama_pemilik ?? '');
    setWhatsapp(owner?.whatsapp_kos ?? '');
  }, [owner]);

  const submit = async () => {
    if (!namaKos) {
      toast('Nama kos wajib diisi', 'error');
      return;
    }
    await onSubmit({ nama_kos: namaKos, nama_pemilik: namaPemilik, whatsapp_kos: whatsapp });
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title="Edit Data Kos"
      description={owner ? `Email login: ${owner.email}` : ''}
      footer={
        <>
          <Button variant="outline" onPress={onClose}>Batal</Button>
          <Button loading={submitting} onPress={submit}>Simpan</Button>
        </>
      }
    >
      <ScrollView style={{ maxHeight: 360 }}>
        <FormField label="Nama Kos" required>
          <Input value={namaKos} onChangeText={setNamaKos} placeholder="contoh: Kos Kita" />
        </FormField>
        <FormField label="Nama Pemilik">
          <Input value={namaPemilik} onChangeText={setNamaPemilik} placeholder="contoh: Budi" />
        </FormField>
        <FormField label="WhatsApp Kos">
          <Input value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" placeholder="08xxxxxxxxxx" />
        </FormField>
      </ScrollView>
    </Dialog>
  );
}