// TMS 페이지 번역
export const tmsTranslations = {
  ko: {
    tms: {
      hero: {
        badge: "물류 최적화 솔루션",
        title: "복잡한 물류, 빠르고 간편하게 배차",
        subtitle: "파이프트리의 관제기술로\n쉽고 빠르게 배차를 경험하세요!",
        description: ""
      },
      platform: {
        badge: "통합 플랫폼",
        title: "차량·기사·농장·도계장을 하나로!",
        tabs: {
          realtime: "실시간 추적",
          dispatch: "배차 관리",
          erp: "ERP 통합운영",
          plan: "차량관리"
        },
        descriptions: {
          realtime: "차량 위치와 운행 상태를 실시간으로 확인하세요",
          dispatch: "주문에 맞춰 최적의 배차를 자동으로 생성합니다",
          erp: "기존 ERP 시스템과 손쉽게 연동됩니다",
          plan: "차량과 기사 정보를 한눈에 관리하세요"
        }
      },
      enterprise: {
        badge: "TMS의 장점",
        title: "새로운 기술로 편리하게",
        cards: [
          {
            title: "배차 최적화",
            description: "복잡한 주문에 필요 차량 산정",
            image: "/advantages/advantage-0.png"
          },
          {
            title: "실시간 관제",
            description: "현재 위치, 진행 상태 자동 기록",
            image: "/advantages/advantage-1.png"
          },
          {
            title: "ERP 통합운영",
            description: "기사·차량·농장·도계장 데이터 통합",
            image: "/advantages/advantage-2.png"
          },
          {
            title: "AI 경로 추천",
            description: "실시간 교통정보를 반영한 최적경로 예측",
            image: "/advantages/advantage-3.png"
          },
          {
            title: "자동 기록",
            description: "운행·체류·출입 기록 자동 관리",
            image: "/advantages/advantage-4.png"
          },
          {
            title: "데이터 분석",
            description: "운영 효율화를 위한 데이터 기반 인사이트",
            image: "/advantages/advantage-5.png"
          },
          {
            title: "알림 시스템",
            description: "화주, 고객 대상 실시간 배송 조회",
            image: "/advantages/advantage-6.png"
          },
          {
            title: "보고서 생성 (예정)",
            description: "고객사를 위한 KPI 기반 보고서",
            image: "/advantages/advantage-7.png"
          }
        ]
      },
      features: {
        badge: "TMS 사용법",
        title: "주문-배차-관제 끝!",
        blocks: [
          {
            keyword: "주문",
            title: "등록하기",
            description: "복잡했던 기존의 주문 처리 방식을\nTMS로 쉽고 빠르게 경험해 보세요.",
            image: "/usage/order.png",
            cards: [
              {
                icon: "📄",
                title: "직접 주문등록",
                description: "ERP 연동 없이 단독으로 배차를 운영 관리하세요\n간편하게 누구나 입력작업이 가능합니다!"
              },
              {
                icon: "🔄",
                title: "ERP 시스템 연동",
                description: "기존에 사용하던 시스템과 연동해 보세요.\nTMS API는 ERP와 연동이 쉽고 동기화를 자동으로 진행합니다."
              }
            ]
          },
          {
            keyword: "배차",
            title: "쉽고 빠른 5초",
            description: "AI 엔진을 활용한 배차로\n5초만에 빠른 배차를 진행해 보세요.",
            image: "/usage/dispatch.png",
            cards: [
              {
                icon: "🚛",
                title: "배차 최적화",
                description: "차량수와 출하하는 물량에 맞춰 자동으로 매칭해 보세요.\n기사별, 차량크기별 최적화 관리도 가능해요."
              },
              {
                icon: "🔗",
                title: "경로 최적화",
                description: "AI엔진이 입력한 중간 경유지를 지역지도를 기반으로 분석하여 최적의 스케쥴을 알려줍니다."
              }
            ]
          },
          {
            keyword: "관제",
            title: "실시간 차량",
            description: "차량 별 이동 경로와\n정확한 도착 예정 시각을 알려드려요.",
            image: "/usage/control.png",
            cards: [
              {
                icon: "📍",
                title: "실시간 차량 관제",
                description: "TMS 드라이버앱을 통해 기사님들의 운행 위치별 포인트 기록 및 실시간 관제도 가능합니다."
              },
              {
                icon: "⏰",
                title: "시작과 도착 예정 확인",
                description: "모든 차량의 시작과 경유지 및 도착지에 대한 예정시간을 안내드려요.\n나중에 시간을 따로 체크할 필요가 없습니다."
              }
            ]
          }
        ]
      },
      security: {
        badge: "안정성과 데이터 보안",
        title: "안정성의",
        highlight: "TMS",
        cards: [
          {
            title: "클라우드 기반 24/7 안정 운영",
            description: "언제 어디서나 안정적인 서비스 제공"
          },
          {
            title: "암호화된 위치/개인정보 처리",
            description: "철저한 데이터 보안 및 개인정보 보호"
          },
          {
            title: "현장 검증된 표준 프로세스",
            description: "검증된 물류 프로세스로 안전한 운영"
          }
        ]
      },
      download: {
        title: "지금 바로 시작하세요",
        description: "TmS 앱을 다운로드하고\n양계 품질 관리를 혁신하세요",
        buttons: {
          android: "안드로이드 앱 다운로드",
          ios: "iOS 다운로드",
          contact: "도입 문의",
          learnMore: "자세히 알아보기"
        }
      },
      footer: {
        company: "파이프트리 주식회사",
        ceo: "대표: 장유창, 이병권",
        businessNumber: "사업자등록번호: 549-81-01876",
        corporateNumber: "법인등록번호: 110111-7495199",
        address: "사업장 소재지: 대전광역시 서구 구봉산북로21번길 52, 2층(관저동)",
        copyright: "© 2025 Paiptree. All rights reserved.",
        product: {
          title: "제품",
          links: ["TMS 소개", "주요 기능", "요금제", "고객 사례"]
        },
        company_info: {
          title: "회사",
          links: ["회사 소개", "팀", "채용", "파트너십"]
        },
        support: {
          title: "지원",
          links: ["고객 지원", "문서", "FAQ", "문의하기"]
        },
        contact: {
          title: "연락처",
          email: "contact@paiptree.com",
          phone: "+82-2-1234-5678",
          address: "서울특별시 강남구"
        }
      }
    }
  },
  en: {
    tms: {
      hero: {
        badge: "Logistics Optimization Solution",
        title: "Complex logistics, simple dispatch",
        subtitle: "Experience fast and easy dispatch with Paiptree's control technology!",
        description: ""
      },
      platform: {
        badge: "Unified Platform",
        title: "Connecting Vehicles, Drivers, Farms, and Plants!",
        tabs: {
          realtime: "Real-time Tracking",
          dispatch: "Dispatch Management",
          erp: "ERP Integration",
          plan: "Vehicle Management"
        },
        descriptions: {
          realtime: "Track vehicle location and status in real-time",
          dispatch: "Automatically generate optimal dispatch for orders",
          erp: "Easily integrate with your existing ERP system",
          plan: "Manage vehicles and drivers at a glance"
        }
      },
      enterprise: {
        badge: "TMS Advantages",
        title: "Convenient with New Technology",
        cards: [
          {
            title: "Dispatch Optimization",
            description: "Calculate required vehicles for complex orders",
            image: "/advantages/advantage-0.png"
          },
          {
            title: "Real-time Control",
            description: "Auto-record current location and status",
            image: "/advantages/advantage-1.png"
          },
          {
            title: "ERP Integration",
            description: "Unified driver, vehicle, farm, and plant data",
            image: "/advantages/advantage-2.png"
          },
          {
            title: "AI Route Recommendation",
            description: "Optimal route prediction with real-time traffic",
            image: "/advantages/advantage-3.png"
          },
          {
            title: "Auto Recording",
            description: "Automatic management of operation records",
            image: "/advantages/advantage-4.png"
          },
          {
            title: "Data Analytics",
            description: "Data-driven insights for operational efficiency",
            image: "/advantages/advantage-5.png"
          },
          {
            title: "Notification System",
            description: "Real-time delivery tracking for customers",
            image: "/advantages/advantage-6.png"
          },
          {
            title: "Report Generation (Coming Soon)",
            description: "KPI-based reports for clients",
            image: "/advantages/advantage-7.png"
          }
        ]
      },
      features: {
        badge: "How to Use TMS",
        title: "Order-Dispatch-Control Done!",
        blocks: [
          {
            keyword: "Order",
            title: "Registration",
            description: "Experience easy and fast order processing\nwith TMS.",
            image: "/usage/order.png",
            cards: [
              {
                icon: "📄",
                title: "Direct Order Registration",
                description: "Manage dispatch operations standalone without ERP integration. Simple and easy!"
              },
              {
                icon: "🔄",
                title: "ERP System Integration",
                description: "Connect with your existing systems. TMS API easily integrates with ERP, OMS, WMS."
              }
            ]
          },
          {
            keyword: "Dispatch",
            title: "Quick 5-Second",
            description: "Complete dispatch in 5 seconds\nwith AI-powered optimization.",
            image: "/usage/dispatch.png",
            cards: [
              {
                icon: "🚛",
                title: "Dispatch Optimization",
                description: "Minimize vehicles or balance work hours. Regional driver management is also available."
              },
              {
                icon: "🔗",
                title: "Route Optimization",
                description: "AI engine analyzes traffic data to provide optimal destinations and schedules."
              }
            ]
          },
          {
            keyword: "Control",
            title: "Real-time Vehicle",
            description: "Track vehicle routes and\nget accurate arrival times.",
            image: "/usage/control.png",
            cards: [
              {
                icon: "📍",
                title: "Real-time Vehicle Tracking",
                description: "When drivers use the TMS Driver app, GPS tracks real-time movement."
              },
              {
                icon: "⏰",
                title: "Accurate ETA",
                description: "Get notified of arrival times via alerts. No more wondering when delivery/pickup will happen."
              }
            ]
          }
        ]
      },
      security: {
        badge: "Stability & Data Security",
        title: "Stability of",
        highlight: "TMS",
        cards: [
          {
            title: "Cloud-based 24/7 Stable Operations",
            description: "Reliable service anytime, anywhere"
          },
          {
            title: "Encrypted Location/Personal Data",
            description: "Thorough data security and privacy protection"
          },
          {
            title: "Field-Verified Standard Process",
            description: "Safe operations with proven logistics processes"
          }
        ]
      },
      download: {
        title: "Get Started Now",
        description: "Download TmS app and transform\nyour poultry quality management",
        buttons: {
          android: "Get Android App",
          ios: "Get iOS App",
          contact: "Request Demo",
          learnMore: "Learn More"
        }
      },
      footer: {
        company: "Paiptree Inc.",
        ceo: "CEO: Jang Yuchang, Lee Byungkwon",
        businessNumber: "Business Registration Number: 549-81-01876",
        corporateNumber: "Corporate Registration Number: 110111-7495199",
        address: "Address: 52, Gubongsanbuk-ro 21beon-gil, Seo-gu, Daejeon, 2nd Floor (Gwanjeo-dong)",
        copyright: "© 2025 Paiptree. All rights reserved.",
        product: {
          title: "Product",
          links: ["About TMS", "Features", "Pricing", "Case Studies"]
        },
        company_info: {
          title: "Company",
          links: ["About Us", "Team", "Careers", "Partnership"]
        },
        support: {
          title: "Support",
          links: ["Customer Support", "Documentation", "FAQ", "Contact"]
        },
        contact: {
          title: "Contact",
          email: "contact@paiptree.com",
          phone: "+82-2-1234-5678",
          address: "Gangnam-gu, Seoul"
        }
      }
    }
  }
} as const;
