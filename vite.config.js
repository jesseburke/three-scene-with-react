import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
const { resolve } = require('path');

export default defineConfig({
    base: '/u/jburke/',
    plugins: [reactRefresh()],
    build: {
        rollupOptions: {
            input: {
                function_grapher: resolve(__dirname, 'examples/function-grapher/index.html')
            },
            output: {
                dir: 'dist'
            }
        }
    },
    optimizeDeps: {
        include: ['jotai/utils']
    },
    server: {
        watch: {
            usePolling: true
        },
        hmr: {
            protocol: 'ws',
            host: 'localhost'
        }
    }
});
