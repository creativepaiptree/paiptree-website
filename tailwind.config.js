/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Future Blue 테마
        'brand-primary': '#2563EB',    // 강렬한 블루
        'brand-secondary': '#7C3AED',  // 퍼플 액센트
        'brand-accent': '#F59E0B',     // 앰버 포인트
        'brand-dark': '#111827',       // 다크
        'brand-light': '#F9FAFB',      // 라이트
        
        // 기존 컬러 (호환성)
        'brand-orange': '#F59E0B',     // 앰버로 변경
        'brand-teal': '#2563EB',       // 프라이머리로 변경
        'brand-navy': '#111827',       // 다크로 변경
        'brand-gray': '#64748B'
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
