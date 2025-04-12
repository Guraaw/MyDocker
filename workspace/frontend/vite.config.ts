import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(async () => {
  const { default: tailwindcss } = await import('@tailwindcss/vite')
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: 3000
    }
  }
})