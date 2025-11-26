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
        // Stability AI 개선된 컬러 팔레트
        'stability': {
          // Primary colors (더 차분하고 세련된 톤)
          'purple': '#6366F1',      // 기존 #8B5CF6에서 더 차분하게
          'pink': '#D946EF',        // 기존 #EC4899에서 덜 선명하게
          'blue': '#3B82F6',        // 유지하되 사용량 줄이기

          // Background colors (완전한 검정 대신 부드러운 다크)
          'dark': '#030712',        // 기존 #0F0F23 대신 더 자연스러운 다크
          'darker': '#020617',      // 기존 #0A0A1A 대신 더 부드러운 다크

          // Gray scale (더 자연스러운 그레이 톤)
          'gray': {
            '50': '#f8fafc',
            '100': '#f1f5f9',
            '200': '#e2e8f0',
            '300': '#cbd5e1',
            '400': '#94a3b8',
            '500': '#64748b',
            '600': '#475569',
            '700': '#334155',
            '800': '#1e293b',
            '900': '#0f172a',
            '950': '#020617'
          }
        }
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'archivo': ['Archivo', 'sans-serif'],
        'gmarket': ['Gmarket Sans', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'particle-float': 'particle-float 8s infinite linear',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      maxWidth: {
        '8xl': '1600px', // Stability.ai exact width
      }
    },
  },
  plugins: [],
}
