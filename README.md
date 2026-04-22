# 빗물펌프장 수위 모니터 (water-lv-mntr)

대구광역시 빗물펌프장 22개소 실시간 수위·경보 모니터링 크로스플랫폼 앱.
**단일 코드베이스로 iOS · Android · PC(웹)** 에서 동작합니다.

## 포함 기능 (4단계 · 모바일 앱 요구사항)

- [x] 메인 화면 · 22개소 지도 + 상태별 색상 표시
- [x] 펌프장 상세 · 실시간 수위 차트 + 24시간 추이
- [x] 경보 화면 · 4단계별 알림음 · 진동 · 풀스크린
- [x] 오프라인 대응 · 마지막 값 캐싱 + 연결 상태 표시
- [x] 당직자 인수인계 · 야간 교대 경보 책임자 지정
- [x] 푸시 토큰 등록 + 배터리 최적화 예외 가이드
- [x] 다크 / 라이트 / 시스템 모드 선택 (AsyncStorage 영속화)

## 스택

- Expo (React Native + React Native Web) — iOS / Android / PC(웹) 동시 지원
- TypeScript
- React Navigation (Native Stack)
- Zustand (상태) · AsyncStorage (오프라인 캐시)
- react-native-svg (지도/차트 렌더링, 3개 플랫폼 공통)
- expo-notifications (FCM / APNs 토큰), expo-haptics, React Native Vibration
- @react-native-community/netinfo (연결 상태)
- WebAudio API (웹 경보음), Vibration + Haptics (모바일 경보)

## 실행

```bash
npm install
npm run web      # PC 브라우저
npm run ios      # iOS 시뮬레이터
npm run android  # Android 에뮬레이터
```

또는 `npm start` 로 Expo Dev 서버를 열어 QR 로 실기기 테스트.

## 데이터 출처

- `src/data/stations.ts` 의 22개 펌프장 마스터 정보는 **대구광역시_빗물펌프장 현황_20250409.csv** 에서 추출. 가동/한계수위는 CSV 값을 그대로 사용, 4단계 경보 임계값(L1~L4)은 가동~한계 구간을 선형 보간.

## 아키텍처 매핑

| 백엔드 컴포넌트 | 앱 연결점 |
|---|---|
| FastAPI REST | `src/services/` 교체 지점 (현재는 `simulator.ts` 모킹) |
| FastAPI WebSocket | `store.tick()` 을 WS `onMessage` 로 대체 |
| TimescaleDB 24h 쿼리 | `simulate24hTrend()` 을 `/stations/:id/history?range=24h` 로 교체 |
| 알람 엔진 (4단계) | `buildAlertsFromReadings()` · `startAlarm(level)` |
| FCM / APNs | `src/services/notifications.ts#registerForPush()` |

## 운영 체크리스트 (설정 화면)

1. 앱 최초 실행 → **설정 → 푸시 토큰 등록**
2. **설정 → 배터리 최적화 예외 가이드** 완료 체크
3. **당직 인수인계** 에서 야간 교대 주/백업 책임자 · 연락처 지정
4. 네트워크 단절 시 상단에 오프라인 배너 + 마지막 수신 시각 표시
5. 설정 → 화면 테마 에서 라이트 / 다크 / 시스템 선택
