import NetInfo from '@react-native-community/netinfo';
import { useAppStore } from '@/store/useAppStore';

export function attachNetworkWatcher(): () => void {
  const unsub = NetInfo.addEventListener((state) => {
    const online = !!state.isConnected && state.isInternetReachable !== false;
    useAppStore.getState().setOnline(online);
  });
  return unsub;
}
