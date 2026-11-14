import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
// HTTPS in dev (self-signed) so camera works from other devices too; localhost works either way.
export default defineConfig({ plugins: [react(), basicSsl()], base: './', build: { chunkSizeWarningLimit: 4000 } })
