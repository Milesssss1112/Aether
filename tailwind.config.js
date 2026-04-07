export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mac: {
          bg: '#0a0a0a',
          card: '#1c1c1e',
          border: '#2c2c2e',
          text: '#f5f5f7',
          secondary: '#98989d',
          blue: '#0a84ff',
          sidebar: '#161618',
        }
      },
      borderRadius: {
        'mac': '12px',
      },
      boxShadow: {
        'mac': '0 2px 8px rgba(0,0,0,0.08)',
        'mac-hover': '0 4px 16px rgba(0,0,0,0.12)',
      }
    },
  },
  plugins: [],
}
