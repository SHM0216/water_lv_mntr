import React, { useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as KeepAwake from 'expo-keep-awake';
import { RootStackParamList } from '@/navigation/types';
import { useAppStore } from '@/store/useAppStore';
import { stationById } from '@/data/stations';
import { ALERT_LABELS, AlertLevel } from '@/types';
import { colors, levelBg, levelColors, radius, spacing } from '@/theme';
import { startAlarm, stopAlarm } from '@/services/alarm';

type Props = NativeStackScreenProps<RootStackParamList, 'Alerts'>;

export function AlertsScreen({ navigation }: Props) {
  const alerts = useAppStore((s) => s.alerts);
  const acknowledgeAlert = useAppStore((s) => s.acknowledgeAlert);
  const { width, height } = useWindowDimensions();
  const isFullscreenCapable = width >= 600 || height >= 700;

  const topActive = useMemo(() => {
    const unacked = alerts.filter((a) => !a.acknowledged);
    if (unacked.length === 0) return null;
    return unacked.reduce((m, a) => (a.level > m.level ? a : m), unacked[0]);
  }, [alerts]);

  const activeLevel: AlertLevel = topActive?.level ?? 0;
  const prevLevelRef = useRef<AlertLevel>(0);

  useEffect(() => {
    if (activeLevel !== prevLevelRef.current) {
      prevLevelRef.current = activeLevel;
      if (activeLevel > 0) {
        startAlarm(activeLevel);
        if (activeLevel >= 3) KeepAwake.activateKeepAwakeAsync('alerts').catch(() => {});
      } else {
        stopAlarm();
        KeepAwake.deactivateKeepAwake('alerts');
      }
    }
  }, [activeLevel]);

  useEffect(() => {
    return () => {
      stopAlarm();
      KeepAwake.deactivateKeepAwake('alerts');
    };
  }, []);

  const sorted = useMemo(
    () => [...alerts].sort((a, b) => b.timestamp - a.timestamp),
    [alerts],
  );

  return (
    <View style={[styles.root, activeLevel >= 3 && { backgroundColor: levelBg[activeLevel] }]}>
      {topActive && (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: levelBg[activeLevel],
              borderColor: levelColors[activeLevel],
            },
            activeLevel === 4 && isFullscreenCapable && styles.fullscreenBanner,
          ]}
        >
          <Text style={[styles.bannerLevel, { color: levelColors[activeLevel] }]}>
            {ALERT_LABELS[activeLevel]} 경보
          </Text>
          <Text style={styles.bannerMsg}>{topActive.message}</Text>
          <Text style={styles.bannerTime}>
            {new Date(topActive.timestamp).toLocaleTimeString('ko-KR')}
          </Text>
          <View style={styles.bannerActions}>
            <Pressable
              onPress={() =>
                navigation.navigate('Detail', { stationId: topActive.stationId })
              }
              style={[styles.btn, { backgroundColor: colors.cardHi }]}
            >
              <Text style={styles.btnText}>펌프장 상세</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                await acknowledgeAlert(topActive.id);
              }}
              style={[styles.btn, { backgroundColor: levelColors[activeLevel] }]}
            >
              <Text style={[styles.btnText, { color: '#0A1628' }]}>확인</Text>
            </Pressable>
          </View>
        </View>
      )}

      {!topActive && (
        <View style={styles.calm}>
          <View style={[styles.calmDot, { backgroundColor: colors.online }]} />
          <Text style={styles.calmTitle}>현재 미처리 경보 없음</Text>
          <Text style={styles.calmSub}>모든 펌프장 정상 운영 또는 경보가 확인 처리되었습니다.</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>경보 이력</Text>
      <FlatList
        data={sorted}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm as any }}
        renderItem={({ item }) => {
          const station = stationById(item.stationId);
          return (
            <View style={[styles.row, { borderLeftColor: levelColors[item.level] }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  [{ALERT_LABELS[item.level]}] {station?.name ?? item.stationId}
                </Text>
                <Text style={styles.rowMsg}>{item.message}</Text>
                <Text style={styles.rowTime}>
                  {new Date(item.timestamp).toLocaleString('ko-KR')}
                  {item.acknowledged && item.ackBy
                    ? ` · ${item.ackBy} 확인 ${new Date(item.ackAt!).toLocaleTimeString('ko-KR')}`
                    : ''}
                </Text>
              </View>
              {!item.acknowledged && (
                <Pressable
                  onPress={() => acknowledgeAlert(item.id)}
                  style={[styles.btn, { backgroundColor: colors.cardHi }]}
                >
                  <Text style={styles.btnText}>확인</Text>
                </Pressable>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={{ color: colors.textDim, padding: spacing.lg }}>이력 없음</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  banner: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
  },
  fullscreenBanner: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  bannerLevel: { fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  bannerMsg: { color: colors.text, fontSize: 16, marginTop: 8, lineHeight: 22 },
  bannerTime: { color: colors.textDim, fontSize: 12, marginTop: 8 },
  bannerActions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md as any,
  },
  btn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }),
  },
  btnText: { color: colors.text, fontWeight: '700' },
  calm: {
    alignItems: 'center',
    padding: spacing.xxl,
    margin: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  calmDot: { width: 14, height: 14, borderRadius: 7, marginBottom: spacing.sm },
  calmTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  calmSub: { color: colors.textDim, fontSize: 12, marginTop: 4, textAlign: 'center' },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: spacing.md,
  },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  rowMsg: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  rowTime: { color: colors.textSub, fontSize: 11, marginTop: 4 },
});
