# Paiptree Website

> Professional design system and UI component library

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development
- Development server: `http://localhost:3001`
- Auto-reload enabled
- TypeScript support
- Tailwind CSS ready

### Deployment
- Push to `main` branch triggers automatic deployment
- GitHub Actions builds and deploys to server
- Static files deployed to `http://52.79.116.76`

## 🛠️ Tech Stack
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: GitHub Actions → EC2 Server

## 📁 Project Structure
```
src/
├── app/              # App Router pages
├── components/       # Reusable components
├── data/
│   └── translations/ # i18n translation files (ko, en)
├── hooks/            # Custom React hooks
├── contexts/         # React contexts (Language, etc.)
└── types/           # TypeScript definitions
```

## 🌐 Internationalization (i18n)

### Translation Files
번역 파일은 `src/data/translations/` 디렉토리에서 관리됩니다:

- **`common.ts`** - Header, Footer 등 공통 번역
- **`home.ts`** - 홈페이지 전용 번역
- **`index.ts`** - 번역 통합 관리 (모든 번역을 합침)

### Supported Languages
- 한국어 (ko)
- English (en)

### Usage Example
```tsx
import { useTranslation } from '@/hooks/useTranslation';

function Component() {
  const { t } = useTranslation();

  return <h1>{t('header.nav.products')}</h1>;
  // Output: "제품" (ko) or "Products" (en)
}
```

### Adding New Translations
1. `src/data/translations/` 폴더에 새 파일 추가 (예: `about.ts`)
2. `ko`와 `en` 객체로 번역 정의
3. `src/data/translations/index.ts`에서 import 및 merge
```tsx
// about.ts
export const aboutTranslations = {
  ko: { /* 한국어 번역 */ },
  en: { /* English translations */ }
} as const;

// index.ts
import { aboutTranslations } from './about';
export const translations = mergeTranslations(
  commonTranslations,
  homeTranslations,
  aboutTranslations  // 추가
);
```

## 🎨 Design System
- **Brand Orange**: `#FF6B35`
- **Brand Teal**: `#2DD4BF`
- **Brand Navy**: `#1E293B`
- **Brand Gray**: `#64748B`

## 📝 Development Guidelines
- Components: Arrow functions with `export default`
- File naming: PascalCase for components, camelCase for utilities
- Props interfaces: `ComponentNameProps` pattern
- Custom hooks: Start with `use` prefix

---
*Built with ❤️ for better design workflows*
