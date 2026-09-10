import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { useLiveRefresh } from '@/lib/realtime';
import type { KosSettings } from '@/lib/types';

interface AppContextValue {
  settings: KosSettings | null;
  refreshSettings: () => Promise<KosSettings>;
  updateSettings: (patch: Partial<KosSettings>) => Promise<void>;
}

const AppContext = createContext<AppContextValue>({
  settings: null,
  refreshSettings: async () => ({ nama_kos: 'KosMate', nama_pemilik: '', whatsapp_kos: '', alamat: '', tipe_kos: 'campur', kosong_otomatis: false, tagihan_duitku: false, program_duitku: '', bank: '', logo_url: null, dare_tanggal: false }),
  updateSettings: async () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<KosSettings | null>(null);

  const refreshSettings = useCallback(async () => {
    const s = await api.getSettings();
    setSettings(s);
    return s;
  }, []);

  const updateSettings = useCallback(async (patch: Partial<KosSettings>) => {
    const s = await api.updateSettings(patch);
    setSettings(s);
  }, []);

  useLiveRefresh(refreshSettings);

  useEffect(() => {
    refreshSettings().catch(() => {});
  }, []);

  return <AppContext.Provider value={{ settings, refreshSettings, updateSettings }}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}