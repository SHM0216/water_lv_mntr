import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { LevelReading, PumpStation } from '@/types';
import { DAEGU_BOUNDS, STATIONS } from '@/data/stations';
import { ThemeColors } from '@/theme';
import { useTheme } from '@/theme/useTheme';

type Props = {
  readings: Record<string, LevelReading>;
  onSelect: (stationId: string) => void;
};

const PADDING = 16;

export function StationMap({ readings, onSelect }: Props) {
  const { colors, levelColors, mode } = useTheme();
  const styles = useMemo(() => makeStyles(colors, mode), [colors, mode]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };

  const placed = useMemo(() => {
    if (size.w < 40 || size.h < 40) return [];
    const spanLng = DAEGU_BOUNDS.maxLng - DAEGU_BOUNDS.minLng;
    const spanLat = DAEGU_BOUNDS.maxLat - DAEGU_BOUNDS.minLat;
    const innerW = size.w - PADDING * 2;
    const innerH = size.h - PADDING * 2;
    return STATIONS.map((s) => {
      const x = PADDING + ((s.lng - DAEGU_BOUNDS.minLng) / spanLng) * innerW;
      const y = PADDING + (1 - (s.lat - DAEGU_BOUNDS.minLat) / spanLat) * innerH;
      return { station: s, x, y };
    });
  }, [size]);

  const gridLines = useMemo(() => {
    if (size.w < 40 || size.h < 40) return null;
    const lines: React.ReactNode[] = [];
    const cols = 6;
    const rows = 6;
    for (let i = 1; i < cols; i++) {
      const x = (size.w / cols) * i;
      lines.push(<Line key={`vx${i}`} x1={x} y1={0} x2={x} y2={size.h} stroke={colors.border} strokeOpacity={0.35} strokeWidth={0.5} />);
    }
    for (let j = 1; j < rows; j++) {
      const y = (size.h / rows) * j;
      lines.push(<Line key={`hy${j}`} x1={0} y1={y} x2={size.w} y2={y} stroke={colors.border} strokeOpacity={0.35} strokeWidth={0.5} />);
    }
    return lines;
  }, [size, colors.border]);

  return (
    <View style={styles.container} onLayout={onLayout}>
      {size.w > 0 && (
        <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill}>
          <Rect x={0} y={0} width={size.w} height={size.h} fill={colors.bgSoft} />
          {gridLines}
          {/* 금호강 스키매틱 - 북부 동서 방향 */}
          <Line
            x1={0}
            y1={size.h * 0.22}
            x2={size.w}
            y2={size.h * 0.18}
            stroke={colors.textDim}
            strokeOpacity={0.35}
            strokeWidth={6}
          />
          {/* 신천 스키매틱 - 중앙 남북 방향 */}
          <Line
            x1={size.w * 0.46}
            y1={size.h * 0.2}
            x2={size.w * 0.5}
            y2={size.h * 0.78}
            stroke={colors.textDim}
            strokeOpacity={0.28}
            strokeWidth={4}
          />
          {placed.map(({ station, x, y }) => {
            const r = readings[station.id];
            const c = levelColors[r?.level ?? 0];
            const online = r?.online ?? true;
            return (
              <Circle
                key={station.id}
                cx={x}
                cy={y}
                r={online ? 9 : 7}
                fill={c}
                stroke={colors.bg}
                strokeWidth={2}
                opacity={online ? 1 : 0.55}
              />
            );
          })}
        </Svg>
      )}
      {placed.map(({ station, x, y }) => (
        <Pressable
          key={station.id}
          onPress={() => onSelect(station.id)}
          style={[
            styles.hit,
            {
              left: x - 18,
              top: y - 18,
            },
          ]}
          accessibilityLabel={`${station.name} 상세 보기`}
        >
          <Text style={styles.hitLabel}>{stationShort(station)}</Text>
        </Pressable>
      ))}
      <View style={styles.legend} pointerEvents="none">
        {(
          [
            [0, '정상'],
            [1, '관심'],
            [2, '주의'],
            [3, '경계'],
            [4, '심각'],
          ] as const
        ).map(([lvl, label]) => (
          <View key={lvl} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: levelColors[lvl] }]} />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function stationShort(s: PumpStation): string {
  return s.name.replace('펌프장', '');
}

const makeStyles = (colors: ThemeColors, mode: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.bgSoft,
      position: 'relative',
      minHeight: 300,
    },
    hit: {
      position: 'absolute',
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'flex-end',
      ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }),
    },
    hitLabel: {
      color: colors.text,
      fontSize: 9,
      marginTop: 18,
      textShadowColor: mode === 'dark' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)',
      textShadowRadius: 2,
      fontWeight: '600',
    },
    legend: {
      position: 'absolute',
      left: 12,
      bottom: 12,
      flexDirection: 'row',
      backgroundColor: colors.overlay,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
    legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    legendText: { color: colors.text, fontSize: 11 },
  });
