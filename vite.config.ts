import react from '@vitejs/plugin-react-swc'
import { componentTagger } from 'lovable-tagger'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: '::',
        port: 8080,
        // Security: Restrict file system access
        fs: {
            strict: true,
            allow: [path.resolve(__dirname, '.')],
            deny: ['**/.git/**', '**/.env*', '**/node_modules/**/.git/**'],
        },
    },
    plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        sourcemap: mode === 'development',
    },
}))
