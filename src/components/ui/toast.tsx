import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { Colors, FontFamily, Radius } from '@/constants/theme';

type ToastType = 'success' | 'error' | 'default';
interface ToastMsg {
  title: string;
  type: ToastType;
  id: number;
}
interface ToastContextValue {
  toast: (title: string, type?: ToastType) => void;
}
const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

const BG: Record<ToastType, string> = { success: '#065F46', error: '#7F1D1D', default: '#0F172A' };

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => setMsg(null));
  }, [opacity]);

  const toast = useCallback((title: string, type: ToastType = 'default') => {
    if (timer.current) clearTimeout(timer.current);
    setMsg({ title, type, id: ++toastId });
    Animated.timing(opacity, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    timer.current = setTimeout(hide, 2600);
  }, [opacity, hide]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {msg ? (
        <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 52, left: 16, right: 16, opacity, zIndex: 999 }}>
          <View style={{ backgroundColor: BG[msg.type], borderRadius: Radius.md, paddingHorizontal: 16, paddingVertical: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}>
            <Text style={{ color: '#FFFFFF', fontFamily: FontFamily.semibold, fontSize: 14 }}>{msg.title}</Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}