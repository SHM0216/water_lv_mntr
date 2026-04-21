import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { useAppStore } from '@/store/useAppStore';

function formatAgo(ts: number | null): string {
  if (!ts) return '--';
  const sec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (sec < 60) return `${sec}초 전`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  return `${h}시간 ${min % 60}분 전`;
}

export function ConnectionBanner() {
  const online = useAppStore((s) => s.online);
  const cacheAt = useAppStore((s) => s.cacheAt);
  const currentTime = useAppStore((s) => s.currentTime);
  // tick currentTime is used so the "ago" string re-renders
  void currentTime;
  if (online) return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.dot} />
      <Text style={styles.text}>
        오프라인 · 마지막 수신 {formatAgo(cacheAt)} · 캐시된 값 표시 중
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108,122,137,0.22)',
    borderColor: colors.offline,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.offline,
    marginRight: spacing.sm,
  },
  text: { color: colors.text, fontSize: 13, flex: 1 },
});
