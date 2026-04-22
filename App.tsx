import React, { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppStore } from '@/store/useAppStore';
import { attachNetworkWatcher } from '@/services/network';
import { useTheme } from '@/theme/useTheme';
import { RootStackParamList } from '@/navigation/types';
import { HomeScreen } from '@/screens/HomeScreen';
import { DetailScreen } from '@/screens/DetailScreen';
import { AlertsScreen } from '@/screens/AlertsScreen';
import { DutyScreen } from '@/screens/DutyScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const hydrate = useAppStore((s) => s.hydrate);
  const tick = useAppStore((s) => s.tick);

  useEffect(() => {
    hydrate().catch(() => {});
    const unsub = attachNetworkWatcher();
    const id = setInterval(() => tick(), 30_000);
    const warmup = setTimeout(() => tick(), 2_000);
    return () => {
      clearInterval(id);
      clearTimeout(warmup);
      unsub();
    };
  }, [hydrate, tick]);

  return (
    <SafeAreaProvider>
      <ThemedRoot />
    </SafeAreaProvider>
  );
}

function ThemedRoot() {
  const { colors, mode } = useTheme();
  const navTheme = useMemo(() => {
    const base = mode === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: mode === 'dark',
      colors: {
        ...base.colors,
        background: colors.bg,
        card: colors.bg,
        text: colors.text,
        border: colors.border,
        primary: colors.accent,
        notification: colors.accent,
      },
    };
  }, [mode, colors]);

  const styles = useMemo(
    () => StyleSheet.create({ root: { flex: 1, backgroundColor: colors.bg } }),
    [colors.bg],
  );

  return (
    <View style={styles.root}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: Platform.OS === 'web' ? 'none' : 'default',
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Detail" component={DetailScreen} />
            <Stack.Screen name="Alerts" component={AlertsScreen} />
            <Stack.Screen name="Duty" component={DutyScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </View>
  );
}
