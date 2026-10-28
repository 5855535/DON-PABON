import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Permite usar WHATSAPP_PHONE tal cual (además de VITE_*) en el .env
  envPrefix: ['VITE_', 'WHATSAPP_'],
})
