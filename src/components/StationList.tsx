import React, { useMemo } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LevelReading } from '@/types';
import { STATIONS } from '@/data/stations';
import { radius, spacing, ThemeColors } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { StatusBadge } from './StatusBadge';

type Props = {
  readings: Record<string, LevelReading>;
  onSelect: (stationId: string) => void;
};

export function StationList({ readings, onSelect }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const data = [...STATIONS].sort((a, b) => {
    const la = readings[a.id]?.level ?? 0;
    const lb = readings[b.id]?.level ?? 0;
    if (lb !== la) return lb - la;
    return a.name.localeCompare(b.name, 'ko');
  });

  return (
    <FlatList
      data={data}
      keyExtractor={(s) => s.id}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      renderItem={({ item }) => {
        const r = readings[item.id];
        const level = r?.level ?? 0;
        const online = r?.online ?? true;
        return (
          <Pressable
            onPress={() => onSelect(item.id)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityLabel={`${item.name} 상세 보기`}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>
                {item.district} · 펌프 {r?.pumpsRunning ?? 0}/{r?.pumpsTotal ?? 0} 가동
              </Text>
            </View>
            <View style={styles.rightCol}>
              <Text style={styles.level}>내 {r?.innerLevelM.toFixed(2) ?? '--'}m</Text>
              <Text style={styles.levelSub}>외 {r?.outerLevelM.toFixed(2) ?? '--'}m</Text>
            </View>
            <StatusBadge level={level} online={online} compact />
          </Pressable>
        );
      }}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
    />
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      backgroundColor: colors.card,
      marginHorizontal: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }),
    },
    rowPressed: { backgroundColor: colors.cardHi },
    name: { color: colors.text, fontSize: 15, fontWeight: '700' },
    sub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
    rightCol: { alignItems: 'flex-end', marginRight: spacing.md },
    level: { color: colors.text, fontSize: 14, fontWeight: '600' },
    levelSub: { color: colors.textDim, fontSize: 11, marginTop: 2 },
    sep: { height: spacing.sm },
  });
