import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { LevelReading, PumpStation } from '@/types';
import { colors, levelColors } from '@/theme';

type Props = {
  station: PumpStation;
  series: LevelReading[];
};

const PAD = { l: 40, r: 12, t: 12, b: 26 };

export function LevelChart({ station, series }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };

  const { innerPath, outerPath, yTicks, xTicks, yMax } = useMemo(() => {
    if (series.length < 2 || size.w < 40 || size.h < 40) {
      return { innerPath: '', outerPath: '', yTicks: [], xTicks: [], yMax: 1 };
    }
    const w = size.w - PAD.l - PAD.r;
    const h = size.h - PAD.t - PAD.b;
    const t0 = series[0].timestamp;
    const t1 = series[series.length - 1].timestamp;
    const dt = Math.max(1, t1 - t0);
    const yMaxRaw = Math.max(
      station.outerThreshold.l4 * 1.1,
      ...series.map((r) => Math.max(r.innerLevelM, r.outerLevelM)),
    );
    const yMax = Math.ceil(yMaxRaw * 2) / 2;

    const xOf = (t: number) => PAD.l + ((t - t0) / dt) * w;
    const yOf = (v: number) => PAD.t + (1 - v / yMax) * h;

    const build = (key: 'innerLevelM' | 'outerLevelM') => {
      let d = '';
      series.forEach((r, i) => {
        const x = xOf(r.timestamp);
        const y = yOf(r[key]);
        d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
      });
      return d;
    };

    const yTicks: { y: number; label: string }[] = [];
    const step = yMax / 4;
    for (let i = 0; i <= 4; i++) {
      const v = step * i;
      yTicks.push({ y: yOf(v), label: `${v.toFixed(1)}` });
    }

    const xTicks: { x: number; label: string }[] = [];
    for (let i = 0; i <= 4; i++) {
      const t = t0 + (dt * i) / 4;
      xTicks.push({ x: xOf(t), label: formatHour(new Date(t)) });
    }

    return { innerPath: build('innerLevelM'), outerPath: build('outerLevelM'), yTicks, xTicks, yMax };
  }, [series, size, station]);

  const thresholdLines = useMemo(() => {
    if (size.w < 40) return [] as React.ReactNode[];
    const h = size.h - PAD.t - PAD.b;
    const yOf = (v: number) => PAD.t + (1 - v / yMax) * h;
    const out: React.ReactNode[] = [];
    (
      [
        [station.outerThreshold.l1, 1, '관심'],
        [station.outerThreshold.l2, 2, '주의'],
        [station.outerThreshold.l3, 3, '경계'],
        [station.outerThreshold.l4, 4, '심각'],
      ] as const
    ).forEach(([v, lvl, label]) => {
      const y = yOf(v);
      out.push(
        <Line
          key={`th-${lvl}`}
          x1={PAD.l}
          x2={size.w - PAD.r}
          y1={y}
          y2={y}
          stroke={levelColors[lvl]}
          strokeOpacity={0.5}
          strokeDasharray="4 4"
          strokeWidth={1}
        />,
      );
      out.push(
        <SvgText
          key={`th-lb-${lvl}`}
          x={size.w - PAD.r - 2}
          y={y - 2}
          fill={levelColors[lvl]}
          fontSize={9}
          textAnchor="end"
        >
          {label} {v.toFixed(1)}m
        </SvgText>,
      );
    });
    return out;
  }, [station, size, yMax]);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {size.w > 0 && (
        <Svg width={size.w} height={size.h}>
          <Rect x={0} y={0} width={size.w} height={size.h} fill={colors.card} />
          {yTicks.map((t, i) => (
            <React.Fragment key={`y${i}`}>
              <Line x1={PAD.l} x2={size.w - PAD.r} y1={t.y} y2={t.y} stroke={colors.border} strokeOpacity={0.35} />
              <SvgText x={PAD.l - 6} y={t.y + 3} fill={colors.textDim} fontSize={10} textAnchor="end">
                {t.label}
              </SvgText>
            </React.Fragment>
          ))}
          {xTicks.map((t, i) => (
            <SvgText
              key={`x${i}`}
              x={t.x}
              y={size.h - 8}
              fill={colors.textDim}
              fontSize={10}
              textAnchor="middle"
            >
              {t.label}
            </SvgText>
          ))}
          {thresholdLines}
          <Path d={outerPath} stroke="#4F8BFF" strokeWidth={2} fill="none" />
          <Path d={innerPath} stroke="#2ECC71" strokeWidth={2} fill="none" />
        </Svg>
      )}
      <View style={styles.legend} pointerEvents="none">
        <LegendDot color="#2ECC71" label="내수위(m)" />
        <LegendDot color="#4F8BFF" label="외수위(m)" />
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function formatHour(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

const styles = StyleSheet.create({
  wrap: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legend: {
    position: 'absolute',
    top: 6,
    right: 10,
    flexDirection: 'row',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  legendSwatch: { width: 10, height: 3, marginRight: 4 },
  legendText: { color: colors.textDim, fontSize: 10 },
});
