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
- Development server: `http://localhost:3000`
- Auto-reload enabled
- TypeScript support
- Tailwind CSS ready

### Deployment
- Push to `main` branch triggers automatic deployment
- GitHub Actions builds and deploys to server
- Static files deployed to `http://3.35.59.119`

## 🛠️ Tech Stack
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: GitHub Actions → CentOS Server

## 📁 Project Structure
```
src/
├── app/              # App Router pages
├── components/       # Reusable components
└── types/           # TypeScript definitions
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
