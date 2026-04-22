import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { useAppStore } from '@/store/useAppStore';
import { STATIONS } from '@/data/stations';
import { radius, spacing, ThemeColors } from '@/theme';
import { useTheme, useThemeMode } from '@/theme/useTheme';
import { OSMStationMap } from '@/components/OSMStationMap';
import { StationList } from '@/components/StationList';
import { ConnectionBanner } from '@/components/ConnectionBanner';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { colors, levelColors } = useTheme();
  const { resolved, setMode } = useThemeMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const readings = useAppStore((s) => s.readings);
  const alerts = useAppStore((s) => s.alerts);
  const [view, setView] = useState<'map' | 'list'>('map');
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const counts = useMemo(() => {
    const c = [0, 0, 0, 0, 0];
    for (const s of STATIONS) {
      const lvl = readings[s.id]?.level ?? 0;
      c[lvl]++;
    }
    return c;
  }, [readings]);

  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>대구광역시 빗물펌프장 22개소</Text>
          <Text style={styles.subtitle}>실시간 수위 모니터링 · 30초 주기 갱신</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm as any }}>
          <Pressable
            onPress={() => setMode(resolved === 'dark' ? 'light' : 'dark')}
            style={styles.iconBtn}
            accessibilityLabel="테마 전환"
          >
            <Text style={styles.iconBtnText}>{resolved === 'dark' ? '☀︎ 라이트' : '☾ 다크'}</Text>
          </Pressable>
          <Pressable
            style={[styles.alertPill, activeAlerts.length > 0 && styles.alertPillHot]}
            onPress={() => navigation.navigate('Alerts')}
            accessibilityLabel="경보 목록 열기"
          >
            <View style={[styles.dot, { backgroundColor: activeAlerts.length ? levelColors[4] : colors.online }]} />
            <Text style={styles.alertPillText}>경보 {activeAlerts.length}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.summaryRow}>
        {([0, 1, 2, 3, 4] as const).map((lvl) => (
          <View key={lvl} style={styles.summaryCell}>
            <View style={[styles.summaryDot, { backgroundColor: levelColors[lvl] }]} />
            <Text style={styles.summaryCount}>{counts[lvl]}</Text>
            <Text style={styles.summaryLabel}>
              {lvl === 0 ? '정상' : lvl === 1 ? '관심' : lvl === 2 ? '주의' : lvl === 3 ? '경계' : '심각'}
            </Text>
          </View>
        ))}
      </View>

      <ConnectionBanner />

      <View style={styles.tabsRow}>
        <TabButton label="지도" active={view === 'map'} onPress={() => setView('map')} colors={colors} />
        <TabButton label="목록" active={view === 'list'} onPress={() => setView('list')} colors={colors} />
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => navigation.navigate('Duty')} style={styles.linkBtn}>
          <Text style={styles.linkBtnText}>당직 인수인계</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Settings')} style={styles.linkBtn}>
          <Text style={styles.linkBtnText}>설정</Text>
        </Pressable>
      </View>

      <View style={[styles.body, wide && styles.bodyWide]}>
        <View style={[styles.panel, wide ? { flex: 1.2 } : { flex: 1, display: view === 'map' ? 'flex' : 'none' }]}>
          <OSMStationMap
            readings={readings}
            onSelect={(id) => navigation.navigate('Detail', { stationId: id })}
          />
        </View>
        {(wide || view === 'list') && (
          <View style={[styles.panel, wide ? { flex: 1 } : { flex: 1 }]}>
            <StationList
              readings={readings}
              onSelect={(id) => navigation.navigate('Detail', { stationId: id })}
            />
          </View>
        )}
      </View>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ThemeColors;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          paddingHorizontal: spacing.md,
          paddingVertical: 6,
          borderRadius: radius.sm,
          marginRight: spacing.sm,
          backgroundColor: active ? colors.accentSoft : colors.card,
          borderWidth: 1,
          borderColor: active ? colors.accent : colors.border,
          ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }),
        },
      ]}
      accessibilityRole="tab"
    >
      <Text
        style={{
          color: active ? colors.text : colors.textDim,
          fontSize: 13,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    title: { color: colors.text, fontSize: 20, fontWeight: '800' },
    subtitle: { color: colors.textDim, fontSize: 12, marginTop: 2 },
    iconBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }),
    },
    iconBtnText: { color: colors.text, fontSize: 12, fontWeight: '600' },
    alertPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }),
    },
    alertPillHot: { borderColor: colors.alertDeep },
    alertPillText: { color: colors.text, fontWeight: '700' },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    summaryRow: {
      flexDirection: 'row',
      marginTop: spacing.md,
      marginHorizontal: spacing.lg,
      backgroundColor: colors.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.sm,
    },
    summaryCell: { flex: 1, alignItems: 'center' },
    summaryDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
    summaryCount: { color: colors.text, fontSize: 18, fontWeight: '800' },
    summaryLabel: { color: colors.textDim, fontSize: 11 },
    tabsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    linkBtn: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      marginLeft: spacing.xs,
      ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }),
    },
    linkBtnText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
    body: {
      flex: 1,
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
    },
    bodyWide: { flexDirection: 'row', gap: spacing.lg as any },
    panel: { flex: 1, minHeight: 300 },
  });
