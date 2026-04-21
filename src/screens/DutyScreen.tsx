import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { useAppStore } from '@/store/useAppStore';
import { DutyAssignment } from '@/types';
import { radius, spacing, ThemeColors } from '@/theme';
import { useTheme } from '@/theme/useTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Duty'>;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DutyScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const duty = useAppStore((s) => s.duty);
  const upsertDuty = useAppStore((s) => s.upsertDuty);
  const removeDuty = useAppStore((s) => s.removeDuty);

  const [form, setForm] = useState<DutyAssignment>({
    id: '',
    date: today(),
    shift: 'night',
    primary: '',
    backup: '',
    phone: '',
    note: '',
  });

  const submit = async () => {
    if (!form.primary.trim() || !form.phone.trim()) {
      const msg = '주 책임자와 연락처는 필수입니다.';
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.alert(msg);
      } else Alert.alert('입력 오류', msg);
      return;
    }
    const id = form.id || `D-${form.date}-${form.shift}-${Date.now()}`;
    await upsertDuty({ ...form, id });
    setForm({ id: '', date: today(), shift: 'night', primary: '', backup: '', phone: '', note: '' });
  };

  const sorted = [...duty].sort((a, b) =>
    a.date === b.date ? a.shift.localeCompare(b.shift) : b.date.localeCompare(a.date),
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>당직자 인수인계</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>교대 지정</Text>
        <Row>
          <Field styles={styles} colors={colors} label="날짜" value={form.date} onChange={(v) => setForm({ ...form, date: v })} placeholder="YYYY-MM-DD" />
          <ShiftToggle styles={styles} value={form.shift} onChange={(v) => setForm({ ...form, shift: v })} />
        </Row>
        <Row>
          <Field styles={styles} colors={colors} label="주 책임자" value={form.primary} onChange={(v) => setForm({ ...form, primary: v })} placeholder="예) 김주임" />
          <Field styles={styles} colors={colors} label="백업" value={form.backup} onChange={(v) => setForm({ ...form, backup: v })} placeholder="예) 박대리" />
        </Row>
        <Row>
          <Field styles={styles} colors={colors} label="연락처" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="010-0000-0000" />
        </Row>
        <Field
          styles={styles}
          colors={colors}
          label="인계 메모"
          value={form.note ?? ''}
          onChange={(v) => setForm({ ...form, note: v })}
          placeholder="야간 집중 호우 예보 · 신천·금호강 유역 중점 모니터링 등"
          multiline
        />
        <Pressable onPress={submit} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>저장 · 인계</Text>
        </Pressable>
      </View>

      <Text style={styles.listTitle}>지정된 교대</Text>
      <FlatList
        data={sorted}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm as any }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>
                {item.date} · {item.shift === 'night' ? '야간' : '주간'} 교대
              </Text>
              <Text style={styles.rowMsg}>
                주 {item.primary}
                {item.backup ? ` · 백업 ${item.backup}` : ''} · {item.phone}
              </Text>
              {!!item.note && <Text style={styles.rowNote}>{item.note}</Text>}
            </View>
            <Pressable onPress={() => removeDuty(item.id)} style={styles.ghostBtn}>
              <Text style={{ color: colors.textDim }}>삭제</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textDim, padding: spacing.lg }}>지정된 교대가 없습니다.</Text>
        }
      />
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', marginBottom: spacing.sm }}>{children}</View>;
}

function Field({
  styles,
  colors,
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  styles: any;
  colors: ThemeColors;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ flex: 1, marginRight: spacing.sm }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSub}
        multiline={multiline}
        style={[styles.input, multiline && { minHeight: 72, textAlignVertical: 'top' }]}
      />
    </View>
  );
}

function ShiftToggle({
  styles,
  value,
  onChange,
}: {
  styles: any;
  value: 'day' | 'night';
  onChange: (v: 'day' | 'night') => void;
}) {
  return (
    <View style={{ width: 180 }}>
      <Text style={styles.fieldLabel}>교대</Text>
      <View style={styles.toggleRow}>
        {(['day', 'night'] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() => onChange(s)}
            style={[styles.toggle, value === s && styles.toggleActive]}
          >
            <Text style={[styles.toggleText, value === s && styles.toggleTextActive]}>
              {s === 'day' ? '주간' : '야간'}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      gap: spacing.md as any,
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
    title: { color: colors.text, fontSize: 20, fontWeight: '800' },
    formCard: {
      margin: spacing.lg,
      padding: spacing.lg,
      backgroundColor: colors.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    formTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: spacing.sm },
    fieldLabel: { color: colors.textDim, fontSize: 12, marginBottom: 4 },
    input: {
      backgroundColor: colors.inputBg,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
    },
    toggleRow: { flexDirection: 'row', gap: spacing.xs as any },
    toggle: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: radius.sm,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }),
    },
    toggleActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
    toggleText: { color: colors.textDim, fontWeight: '600' },
    toggleTextActive: { color: colors.text },
    primaryBtn: {
      marginTop: spacing.md,
      backgroundColor: colors.accent,
      paddingVertical: 12,
      borderRadius: radius.sm,
      alignItems: 'center',
      ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }),
    },
    primaryBtnText: { color: colors.onAccent, fontWeight: '800' },
    listTitle: { color: colors.text, fontSize: 14, fontWeight: '700', paddingHorizontal: spacing.lg },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    rowTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
    rowMsg: { color: colors.textDim, fontSize: 12, marginTop: 2 },
    rowNote: { color: colors.textSub, fontSize: 12, marginTop: 4, fontStyle: 'italic' },
    ghostBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }),
    },
  });
