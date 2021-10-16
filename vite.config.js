import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
const { resolve } = require('path');

export default defineConfig({
    base: '/u/jburke/',
    plugins: [reactRefresh()],
    build: {
        lib: {
            entry: 'index.js',
            formats: ['es'],
            fileName: 'output'
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
