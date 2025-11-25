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
      features: {
        title: "TmS 핵심 기능",
        list: [
          {
            icon: "📋",
            title: "개체 이력 추적",
            description: "입추부터 출하까지 전 과정 기록 및 조회"
          },
          {
            icon: "💉",
            title: "백신 관리",
            description: "접종 일정과 이력을 자동으로 관리"
          },
          {
            icon: "🏭",
            title: "도계 로그 통합",
            description: "도축 및 가공 데이터를 실시간 수집"
          },
          {
            icon: "📊",
            title: "ESG·HACCP 자동 보고",
            description: "식품 안전과 ESG 보고서를 자동 작성"
          }
        ]
      },
      benefits: {
        title: "TmS가 필요한 이유",
        items: [
          {
            title: "추적성 확보",
            description: "문제 발생 시 즉시 원인 추적 가능"
          },
          {
            title: "보고서 자동화",
            description: "수작업 리포트 작성 시간 90% 단축"
          },
          {
            title: "규제 대응",
            description: "HACCP, ESG 인증 준비 간소화"
          }
        ]
      },
      download: {
        title: "지금 바로 시작하세요",
        description: "TmS 앱을 다운로드하고\n양계 품질 관리를 혁신하세요",
        buttons: {
          android: "Android 다운로드",
          ios: "iOS 다운로드",
          contact: "도입 문의",
          learnMore: "더 알아보기"
        }
      },
      footer: {
        company: "주식회사 파이프트리",
        copyright: "© 2025 Paiptree. All rights reserved."
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
      features: {
        title: "TmS Core Features",
        list: [
          {
            icon: "📋",
            title: "Flock Traceability",
            description: "Record and track every stage from placement to shipment"
          },
          {
            icon: "💉",
            title: "Vaccination Management",
            description: "Automate vaccination schedules and history"
          },
          {
            icon: "🏭",
            title: "Slaughter Log Integration",
            description: "Capture slaughter and processing data in real time"
          },
          {
            icon: "📊",
            title: "Auto ESG·HACCP Reports",
            description: "Generate food safety and ESG reports automatically"
          }
        ]
      },
      benefits: {
        title: "Why You Need TmS",
        items: [
          {
            title: "Ensure Traceability",
            description: "Instantly trace root causes when issues arise"
          },
          {
            title: "Automate Reporting",
            description: "Cut manual report time by 90%"
          },
          {
            title: "Meet Regulations",
            description: "Simplify HACCP and ESG compliance"
          }
        ]
      },
      download: {
        title: "Get Started Now",
        description: "Download TmS app and transform\nyour poultry quality management",
        buttons: {
          android: "Download for Android",
          ios: "Download for iOS",
          contact: "Request Demo",
          learnMore: "Learn More"
        }
      },
      footer: {
        company: "Paiptree Inc.",
        copyright: "© 2025 Paiptree. All rights reserved."
      }
    }
  }
} as const;
