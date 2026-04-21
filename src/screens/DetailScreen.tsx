import React, { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { useAppStore } from '@/store/useAppStore';
import { stationById } from '@/data/stations';
import { colors, levelColors, radius, spacing } from '@/theme';
import { StatusBadge } from '@/components/StatusBadge';
import { LevelChart } from '@/components/LevelChart';
import { ConnectionBanner } from '@/components/ConnectionBanner';
import { simulate24hTrend } from '@/services/simulator';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export function DetailScreen({ route, navigation }: Props) {
  const { stationId } = route.params;
  const station = stationById(stationId);
  const reading = useAppStore((s) => s.readings[stationId]);
  const currentTime = useAppStore((s) => s.currentTime);

  const trend = useMemo(
    () => simulate24hTrend(stationId, currentTime, 5 * 60_000),
    [stationId, currentTime],
  );

  if (!station) {
    return (
      <View style={styles.root}>
        <Text style={styles.notFound}>펌프장을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← 목록</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <StatusBadge level={reading?.level ?? 0} online={reading?.online ?? true} />
      </View>

      <Text style={styles.title}>{station.name}</Text>
      <Text style={styles.subtitle}>
        {station.district} · 용량 {station.capacityM3PerMin} m³/분
      </Text>

      <ConnectionBanner />

      <View style={styles.metricsRow}>
        <Metric label="내수위" value={reading ? `${reading.innerLevelM.toFixed(2)} m` : '--'} color={levelColors[reading?.level ?? 0]} />
        <Metric label="외수위" value={reading ? `${reading.outerLevelM.toFixed(2)} m` : '--'} color="#4F8BFF" />
        <Metric
          label="가동 펌프"
          value={reading ? `${reading.pumpsRunning} / ${reading.pumpsTotal}` : '--'}
          color={colors.text}
        />
      </View>

      <Text style={styles.sectionTitle}>24시간 추이</Text>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <LevelChart station={station} series={trend} />
      </View>

      <Text style={styles.sectionTitle}>임계값</Text>
      <View style={styles.thresholdCard}>
        <ThresholdRow title="내수위" t={station.innerThreshold} />
        <View style={styles.divider} />
        <ThresholdRow title="외수위" t={station.outerThreshold} />
      </View>
    </ScrollView>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

function ThresholdRow({ title, t }: { title: string; t: { l1: number; l2: number; l3: number; l4: number } }) {
  return (
    <View style={{ padding: spacing.md }}>
      <Text style={styles.thresholdTitle}>{title}</Text>
      <View style={styles.thresholdRow}>
        {(
          [
            [1, '관심', t.l1],
            [2, '주의', t.l2],
            [3, '경계', t.l3],
            [4, '심각', t.l4],
          ] as const
        ).map(([lvl, label, v]) => (
          <View key={lvl} style={styles.thresholdCell}>
            <View style={[styles.thresholdDot, { backgroundColor: levelColors[lvl] }]} />
            <Text style={styles.thresholdLabel}>{label}</Text>
            <Text style={styles.thresholdValue}>{v.toFixed(1)} m</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  notFound: { color: colors.text, padding: spacing.lg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  backBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }),
  },
  backText: { color: colors.text },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 13,
    paddingHorizontal: spacing.lg,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.md as any,
  },
  metric: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  metricLabel: { color: colors.textDim, fontSize: 12 },
  metricValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  thresholdCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  thresholdTitle: { color: colors.textDim, fontSize: 12, marginBottom: 8 },
  thresholdRow: { flexDirection: 'row' },
  thresholdCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  thresholdDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  thresholdLabel: { color: colors.textDim, fontSize: 11 },
  thresholdValue: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
});
