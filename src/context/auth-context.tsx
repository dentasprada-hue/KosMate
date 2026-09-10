import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AUTH_ENABLED, supabase } from '@/lib/supabase';

export type Role = 'owner' | 'admin' | null;

interface AuthContextValue {
  user: Session['user'] | null;
  role: Role;
  loading: boolean;
  roleLoading: boolean;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  loading: true,
  roleLoading: true,
  refreshRole: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session['user'] | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(AUTH_ENABLED);
  const [roleLoading, setRoleLoading] = useState(AUTH_ENABLED);

  const refreshRole = useCallback(async () => {
    const client = supabase();
    const session = client ? await client.auth.getSession() : null;
    const uid = session?.data?.session?.user?.id;
    if (!client || !AUTH_ENABLED || !uid) {
      setRole(null);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    try {
      const { data } = await client.from('app_users').select('role').eq('user_id', uid).maybeSingle();
      setRole((data?.role as Role) ?? 'owner');
    } finally {
      setRoleLoading(false);
    }
  }, []);

  useEffect(() => {
    const client = supabase();
    if (!client || !AUTH_ENABLED) {
      setUser(null);
      setRole(null);
      setLoading(false);
      setRoleLoading(false);
      return;
    }
    let active = true;

    const sync = async (s: Session | null) => {
      if (!active) return;
      setUser(s?.user ?? null);
      if (!s?.user) {
        setRole(null);
        setRoleLoading(false);
        return;
      }
      setRoleLoading(true);
      const { data } = await client.from('app_users').select('role').eq('user_id', s.user.id).maybeSingle();
      if (active) {
        setRole((data?.role as Role) ?? 'owner');
        setRoleLoading(false);
      }
    };

    client.auth.getSession().then(({ data }) => sync(data.session));
    const { data: sub } = client.auth.onAuthStateChange((_event, s) => sync(s));

    setLoading(false);
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, role, loading, roleLoading, refreshRole }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}