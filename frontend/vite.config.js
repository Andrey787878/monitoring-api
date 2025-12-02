import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			'/health': {
				target: 'http://localhost:8080',
				changeOrigin: true,
			},
			'/ready': {
				target: 'http://localhost:8080',
				changeOrigin: true,
			},
			'/metrics': {
				target: 'http://localhost:8080',
				changeOrigin: true,
			},
		},
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: './src/setupTests.js',
		coverage: {
			enabled: false,
		},
	},
})
