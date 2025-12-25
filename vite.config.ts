import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import fs from 'fs';
import { componentTagger } from 'lovable-tagger';

function copyDenoEntry() {
  return {
    name: 'copy-deno-entry',
    writeBundle() {
      fs.copyFileSync(
        path.resolve(__dirname, 'deno-entry.ts'),
        path.resolve(__dirname, 'dist/main.ts')
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8888,
  },

  plugins: [react(), mode === 'development' && componentTagger(), copyDenoEntry()].filter(Boolean),

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 依赖预构建优化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'recharts',
      '@supabase/supabase-js',
      'lucide-react',
      'date-fns',
      'clsx',
      'tailwind-merge',
    ],
  },

  // 生产环境移除 console/debugger
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },

  // 构建优化
  build: {
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI 基础组件 (Radix)
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
          ],
          // 图表库
          'vendor-charts': ['recharts'],
          // 动画库
          'vendor-motion': ['framer-motion'],
          // 编辑器
          'vendor-codemirror': [
            '@uiw/react-codemirror',
            '@codemirror/lang-json',
            '@codemirror/lang-sql',
          ],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // 工具库
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority', 'zod'],
          // 图标
          'vendor-icons': ['lucide-react'],
          // Swagger UI (仅 API 文档页面使用)
          'vendor-swagger': ['swagger-ui-dist'],
        },
      },
    },
  },

  // CSS 配置
  css: {
    devSourcemap: true,
  },
}));
