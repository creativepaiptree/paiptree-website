import CctvUpClient from './CctvUpClient';

export const metadata = {
  title: 'CCTVUP | Paiptree',
  description: '농장별 5분 CCTV 데이터 수신 모니터',
};

export default function CctvUpPage() {
  return <CctvUpClient />;
}
