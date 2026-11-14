/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] },
      colors: {
        brand: { 50: '#eef4ff', 100: '#dbe6ff', 500: '#3d6bf5', 600: '#2a55e0', 700: '#2144b8', 900: '#13235c' }
      }
    }
  },
  plugins: []
};
