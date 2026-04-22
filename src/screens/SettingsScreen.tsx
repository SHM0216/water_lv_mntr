import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { useAppStore } from '@/store/useAppStore';
import { radius, spacing, ThemeColors, ThemeMode } from '@/theme';
import { useTheme, useThemeMode } from '@/theme/useTheme';
import { registerForPush } from '@/services/notifications';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

function notify(title: string, message: string): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export function SettingsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { mode, resolved, setMode } = useThemeMode();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const pushToken = useAppStore((s) => s.pushToken);
  const setPushToken = useAppStore((s) => s.setPushToken);
  const batteryGuideAck = useAppStore((s) => s.batteryGuideAck);
  const setBatteryAck = useAppStore((s) => s.setBatteryAck);
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const online = useAppStore((s) => s.online);
  const setOnline = useAppStore((s) => s.setOnline);

  const [busy, setBusy] = useState(false);
  const [nameDraft, setNameDraft] = useState(currentUser);

  const register = async () => {
    setBusy(true);
    try {
      const token = await registerForPush();
      if (token) {
        await setPushToken(token);
        notify('등록 완료', '푸시 토큰을 저장했습니다.');
      } else if (Platform.OS === 'web') {
        notify('웹 제한', '웹에서는 푸시 토큰을 발급할 수 없습니다. iOS/Android 앱에서 등록하세요.');
      } else {
        notify('등록 실패', '알림 권한이 거부되었거나 실제 기기가 필요합니다.');
      }
    } finally {
      setBusy(false);
    }
  };

  const openBatterySettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    } else if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>설정</Text>
      </View>

      <Section styles={styles} title="화면 테마">
        <Text style={styles.desc}>
          앱 배경 색상을 선택합니다. ‘시스템’ 은 OS 의 다크모드 설정을 따라갑니다.
          현재 적용: {resolved === 'dark' ? '다크' : '라이트'}
        </Text>
        <View style={styles.segRow}>
          {(
            [
              ['light', '라이트'],
              ['dark', '다크'],
              ['system', '시스템'],
            ] as const
          ).map(([val, label]) => (
            <Pressable
              key={val}
              onPress={() => setMode(val as ThemeMode)}
              style={[styles.segBtn, mode === val && styles.segBtnActive]}
            >
              <Text style={[styles.segText, mode === val && styles.segTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section styles={styles} title="사용자">
        <Text style={styles.fieldLabel}>표시 이름 (경보 확인자)</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm as any }}>
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            placeholder="이름"
            placeholderTextColor={colors.textSub}
            style={styles.input}
          />
          <Pressable
            onPress={() => setCurrentUser(nameDraft.trim() || '당직자')}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>저장</Text>
          </Pressable>
        </View>
      </Section>

      <Section styles={styles} title="푸시 알림">
        <Text style={styles.desc}>
          FCM / APNs 푸시 토큰을 발급받아 백엔드 알람 엔진으로 등록합니다. 경보 4단계(관심·주의·경계·심각)에 따라 서로 다른 채널·소리·진동이 적용됩니다.
        </Text>
        <View style={styles.tokenBox}>
          <Text style={styles.tokenLabel}>현재 토큰</Text>
          <Text style={styles.tokenValue} selectable numberOfLines={3}>
            {pushToken ?? '미등록'}
          </Text>
        </View>
        <Pressable onPress={register} disabled={busy} style={[styles.primaryBtn, busy && { opacity: 0.5 }]}>
          <Text style={styles.primaryBtnText}>{busy ? '등록 중...' : '푸시 토큰 등록'}</Text>
        </Pressable>
      </Section>

      <Section styles={styles} title="배터리 최적화 예외 가이드">
        <Text style={styles.desc}>
          Android 제조사의 배터리 최적화가 켜져 있으면 야간 경보 푸시가 지연/차단될 수 있습니다. 아래 단계를 따라 본 앱을 예외(허용) 목록에 추가해 주세요.
        </Text>
        <View style={styles.steps}>
          <Step styles={styles} n={1} text="설정 → 앱 → 대구 빗물펌프장 수위 모니터 → 배터리" />
          <Step styles={styles} n={2} text="‘제한 없음’ 또는 ‘배터리 최적화 안 함’ 선택" />
          <Step styles={styles} n={3} text="삼성: 설정 → 배터리 → 백그라운드 사용 제한 → 본 앱 제외" />
          <Step styles={styles} n={4} text="샤오미/화웨이: 자동 실행 허용 + 잠금 후에도 알림 표시 ON" />
          <Step styles={styles} n={5} text="iOS: 설정 → 알림 → 본 앱 → 중요 경고/시간 민감 알림 허용" />
        </View>
        {Platform.OS !== 'web' && (
          <Pressable onPress={openBatterySettings} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>시스템 설정 열기</Text>
          </Pressable>
        )}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>가이드 확인 완료</Text>
          <Switch value={batteryGuideAck} onValueChange={setBatteryAck} />
        </View>
      </Section>

      <Section styles={styles} title="개발자 도구">
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>네트워크 온라인 (테스트용 토글)</Text>
          <Switch value={online} onValueChange={setOnline} />
        </View>
        <Text style={styles.desc}>
          실제 환경에서는 단말의 네트워크 상태가 자동 반영됩니다. 오프라인 시 마지막 값이 캐시로부터 표시되고 상단에 연결 끊김 배너가 나타납니다.
        </Text>
      </Section>
    </ScrollView>
  );
}

function Section({ styles, title, children }: { styles: any; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Step({ styles, n, text }: { styles: any; n: number; text: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
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
    section: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
    sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: spacing.sm },
    sectionBody: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.lg,
    },
    desc: { color: colors.textDim, fontSize: 13, lineHeight: 19, marginBottom: spacing.md },
    fieldLabel: { color: colors.textDim, fontSize: 12, marginBottom: 4 },
    input: {
      flex: 1,
      backgroundColor: colors.inputBg,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
    },
    tokenBox: {
      backgroundColor: colors.inputBg,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    tokenLabel: { color: colors.textDim, fontSize: 11, marginBottom: 4 },
    tokenValue: {
      color: colors.text,
      fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
      fontSize: 12,
    },
    primaryBtn: {
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.lg,
      paddingVertical: 10,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }),
    },
    primaryBtnText: { color: colors.onAccent, fontWeight: '800' },
    secondaryBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingVertical: 10,
      borderRadius: radius.sm,
      alignItems: 'center',
      marginTop: spacing.sm,
      ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }),
    },
    secondaryBtnText: { color: colors.text, fontWeight: '600' },
    steps: { gap: spacing.sm as any },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
    stepNum: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
      marginTop: 1,
    },
    stepNumText: { color: colors.text, fontSize: 12, fontWeight: '700' },
    stepText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19 },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    switchLabel: { color: colors.text, fontSize: 13 },
    segRow: { flexDirection: 'row', gap: spacing.xs as any },
    segBtn: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: radius.sm,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }),
    },
    segBtnActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
    segText: { color: colors.textDim, fontWeight: '600' },
    segTextActive: { color: colors.text },
  });
