export type StageItem = {
  href: string;
  key: string;
  label: string;
  title: string;
  description: string;
};

export const stageItems: StageItem[] = [
  {
    key: 'intake',
    href: '/cherry_tms/intake',
    label: 'STEP 01',
    title: '데이터 반입',
    description: '전일 ERP 조회, 엑셀 반입, 우리 DB 적재 상태를 확인한다.',
  },
  {
    key: 'grouping',
    href: '/cherry_tms/grouping',
    label: 'STEP 02',
    title: '묶음 생성',
    description: '운행건을 기사/차량 기준으로 묶고 시작·종료 지역 순을 점검한다.',
  },
  {
    key: 'settlement-register',
    href: '/cherry_tms/settlement-register',
    label: 'STEP 03',
    title: '정산 등록',
    description: '변수 선택, 현재/계약 기준 동시 계산, 기사 지급 기준 금액을 확정한다.',
  },
  {
    key: 'settlement-review',
    href: '/cherry_tms/settlement-review',
    label: 'STEP 04',
    title: '정산 검토',
    description: '일별/월별/기사별 기준으로 등록 완료 건을 검토한다.',
  },
  {
    key: 'monthly-vehicle',
    href: '/cherry_tms/monthly-vehicle',
    label: 'STEP 04A',
    title: '월별 차량',
    description: '정산월·차량번호 기준 월 누계와 유류/운임 차액을 본다.',
  },
  {
    key: 'claim-docs',
    href: '/cherry_tms/claim-docs',
    label: 'STEP 05',
    title: '청구/문서',
    description: '현재 기준 지급과 계약 기준 차액을 정리해 청구 문서를 생성한다.',
  },
];
