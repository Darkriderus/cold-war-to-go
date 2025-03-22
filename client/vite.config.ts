import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [],
	server: {
		host: '0.0.0.0',
		port: 8000,
		proxy: {
			"/ws": {
				target: "ws://localhost:3000",
				ws: true,
			},
		},
	},
	clearScreen: false,

})
