// TMS 사용법 섹션용 SVG 아이콘들 - 새로 디자인

// 직접 주문등록 - 클립보드 + 펜 아이콘
export const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5C15 5.53043 14.7893 6.03914 14.4142 6.41421C14.0391 6.78929 13.5304 7 13 7H11C10.4696 7 9.96086 6.78929 9.58579 6.41421C9.21071 6.03914 9 5.53043 9 5Z" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12H15M9 16H12" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ERP 시스템 연동 - 연결된 박스 아이콘
export const SyncIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="7" height="6" rx="1" stroke="#000000" strokeWidth="1.5"/>
    <rect x="14" y="14" width="7" height="6" rx="1" stroke="#000000" strokeWidth="1.5"/>
    <path d="M10 7H14C15.1046 7 16 7.89543 16 9V14" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M14 17H10C8.89543 17 8 16.1046 8 15V10" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M14 12L16 14L18 12" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 12L8 10L6 12" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


// 배차 최적화 - 차량 + 체크 아이콘
export const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M16 3H1V16H16V3Z" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(2, 2) scale(0.85)"/>
    <path d="M16 8H20L23 11V16H16V8Z" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(2, 2) scale(0.85)"/>
    <circle cx="7.5" cy="18.5" r="2" stroke="#000000" strokeWidth="1.5" transform="translate(0, 0)"/>
    <circle cx="17.5" cy="18.5" r="2" stroke="#000000" strokeWidth="1.5" transform="translate(0, 0)"/>
    <path d="M20 6L21.5 7.5L24 5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(-3, 0)"/>
  </svg>
);

// 경로 최적화 - 지도 핀 + 경로 아이콘
export const RouteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="6" cy="6" r="2.5" stroke="#000000" strokeWidth="1.5"/>
    <circle cx="18" cy="18" r="2.5" stroke="#000000" strokeWidth="1.5"/>
    <path d="M8.5 6H14C15.6569 6 17 7.34315 17 9V10" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15.5 18H10C8.34315 18 7 16.6569 7 15V14" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="17" cy="12" r="1.5" fill="#000000"/>
    <circle cx="7" cy="12" r="1.5" fill="#000000"/>
  </svg>
);

// 실시간 차량 관제 - GPS 신호 아이콘
export const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 21C12 21 19 15.5 19 10C19 6.13401 15.866 3 12 3C8.13401 3 5 6.13401 5 10C5 15.5 12 21 12 21Z" stroke="#000000" strokeWidth="1.5"/>
    <circle cx="12" cy="10" r="3" stroke="#000000" strokeWidth="1.5"/>
    <path d="M12 3V1M19 10H21M12 19V21M5 10H3" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// 시작과 도착 예정 확인 - 캘린더 + 시계 아이콘
export const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#000000" strokeWidth="1.5"/>
    <path d="M3 9H21" stroke="#000000" strokeWidth="1.5"/>
    <path d="M8 2V5M16 2V5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="15" r="3" stroke="#000000" strokeWidth="1.5"/>
    <path d="M12 14V15.5L13 16" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// 아이콘 매핑 객체
export const featureIcons: Record<string, React.FC> = {
  '📄': DocumentIcon,
  '🔄': SyncIcon,
  '🚛': TruckIcon,
  '🔗': RouteIcon,
  '📍': LocationIcon,
  '⏰': ClockIcon,
};
