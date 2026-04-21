import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertLevel, ALERT_LABELS } from '@/types';
import { colors, levelBg, levelColors, radius, spacing } from '@/theme';

type Props = {
  level: AlertLevel;
  online?: boolean;
  compact?: boolean;
};

export function StatusBadge({ level, online = true, compact = false }: Props) {
  const label = online ? ALERT_LABELS[level] : '오프라인';
  const bg = online ? levelBg[level] : 'rgba(156,163,175,0.18)';
  const fg = online ? levelColors[level] : colors.offline;
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: bg, borderColor: fg },
        compact && styles.compact,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <Text style={[styles.label, { color: fg }, compact && styles.labelCompact]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  compact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  labelCompact: {
    fontSize: 11,
  },
});
