import { defineConfig } from 'vite';
import path from 'path';
import compression from 'vite-plugin-compression';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@client': path.resolve(__dirname, './src/client'),
            '@server': path.resolve(__dirname, './src/server'),
            '@shared': path.resolve(__dirname, './src/shared'),
        },
    },
    plugins: [
        // Brotli compression (primary)
        compression({
            algorithm: 'brotliCompress',
            ext: '.br',
            threshold: 1024,
            compressionOptions: { level: 4 }
        }),
        // Gzip fallback
        compression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 1024
        })
    ],
    server: {
        port: 5173,
        host: true
    },
    build: {
        target: 'esnext',
        outDir: 'dist/client',
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three'],
                    colyseus: ['colyseus.js'],
                    supabase: ['@supabase/supabase-js']
                }
            }
        }
    }
});
