// Production Build Configuration for MVC Architecture

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',
    
    // Source map configuration
    sourcemap: false,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2
      },
      mangle: {
        toplevel: true,
        properties: {
          regex: /^_/
        }
      }
    },
    
    // Chunk splitting strategy
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'lucide-react'],
          
          // MVC chunks
          'mvc-core': [
            './src/controllers/ControllerLifecycle.ts',
            './src/patterns/ObserverPattern.ts',
            './src/patterns/FactoryPattern.ts'
          ],
          'mvc-repositories': [
            './src/repositories/RepositoryPattern.ts'
          ],
          'mvc-services': [
            './src/services/domains/QuestionService.ts',
            './src/services/domains/ExamService.ts',
            './src/services/domains/UserService.ts',
            './src/services/domains/AnalyticsService.ts',
            './src/services/domains/MediaService.ts'
          ],
          'mvc-controllers': [
            './src/controllers/question/TOEICQuestionCreatorController.ts',
            './src/controllers/upload/TOEICBulkUploadController.ts',
            './src/controllers/passage/PassageManagerController.ts',
            './src/controllers/exam/ExamReviewController.ts'
          ],
          'mvc-views': [
            './src/views/components/TOEICQuestionCreatorView.tsx',
            './src/views/components/TOEICBulkUploadView.tsx',
            './src/views/components/PassageManagerView.tsx',
            './src/views/components/ExamReviewView.tsx'
          ],
          'mvc-hooks': [
            './src/controllers/question/useTOEICQuestionCreatorController.ts',
            './src/controllers/upload/useTOEICBulkUploadController.ts',
            './src/controllers/passage/usePassageManagerController.ts',
            './src/controllers/exam/useExamReviewController.ts'
          ],
          'mvc-wrappers': [
            './src/views/components/TOEICQuestionCreatorMVC.tsx',
            './src/views/components/TOEICBulkUploadMVC.tsx',
            './src/views/components/PassageManagerMVC.tsx',
            './src/views/components/ExamReviewMVC.tsx'
          ],
          'performance': [
            './src/utils/performanceTesting.ts',
            './src/utils/performanceTestRunner.ts',
            './src/utils/memoryOptimization.ts',
            './src/services/cache/CacheService.ts'
          ],
          'testing': [
            './src/tests/e2e/E2ETestSuite.ts',
            './src/tests/load/LoadTestSuite.ts',
            './src/tests/security/SecurityAuditSuite.ts'
          ]
        },
        
        // Asset naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Target for better compatibility
    target: 'es2015',
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Report compressed size
    reportCompressedSize: true,
    
    // Empty out dir
    emptyOutDir: true
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@views': resolve(__dirname, 'src/views'),
      '@controllers': resolve(__dirname, 'src/controllers'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@patterns': resolve(__dirname, 'src/patterns'),
      '@repositories': resolve(__dirname, 'src/repositories'),
      '@tests': resolve(__dirname, 'src/tests')
    }
  },
  
  // Define environment variables
  define: {
    'process.env.NODE_ENV': '"production"',
    'import.meta.env.PROD': 'true',
    'import.meta.env.DEV': 'false'
  },
  
  // CSS configuration
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    },
    devSourcemap: false
  },
  
  // Server configuration (for preview)
  server: {
    port: 3000,
    host: true,
    open: true
  },
  
  // Preview configuration
  preview: {
    port: 4173,
    host: true,
    open: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      'clsx',
      'tailwind-merge',
      'lucide-react'
    ],
    exclude: [
      'src/tests/**/*',
      'src/**/*.test.ts',
      'src/**/*.spec.ts'
    ]
  },
  
  // Esbuild configuration
  esbuild: {
    drop: ['console', 'debugger'],
    pure: ['console.log', 'console.info', 'console.debug', 'console.warn'],
    legalComments: 'none'
  }
});
