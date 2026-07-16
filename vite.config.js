import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: 'react-native/Libraries/Renderer/shims/ReactFabric',
        replacement: resolve(__dirname, 'src/shims/react-native-web-shims/ReactFabric.js'),
      },
      {
        find: 'react-native/Libraries/Utilities/codegenNativeComponent',
        replacement: resolve(__dirname, 'src/shims/react-native-web-shims/Utilities/codegenNativeComponent.js'),
      },
      {
        find: 'react-native/Libraries/Renderer/shims/NativeComponentRegistry',
        replacement: resolve(__dirname, 'src/shims/react-native-web-shims/ReactFabric.js'),
      },
      {
        find: 'react-native/Libraries/BatchedBridge/TurboModuleRegistry',
        replacement: resolve(__dirname, 'src/shims/react-native-web-shims/ReactFabric.js'),
      },
      {
        find: 'react-native-svg',
        replacement: resolve(__dirname, 'node_modules/react-native-svg-web'),
      },
      {
        find: 'react-native-reanimated',
        replacement: resolve(__dirname, 'src/shims/react-native-reanimated.jsx'),
      },
      {
        find: 'expo-blur',
        replacement: resolve(__dirname, 'src/shims/expo-blur.jsx'),
      },
      {
        find: 'react-native',
        replacement: resolve(__dirname, 'src/shims/react-native.js'),
      },
    ],
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    global: 'globalThis',
  },
  optimizeDeps: {
    // Ensure these packages are pre‑bundled using their web entry points
    include: ['react-native-web', 'react-native-svg-web', 'react-native-safe-area-context'],
    esbuildOptions: {
      define: {
        global: 'window',
        __DEV__: 'true',
        'process.env.NODE_ENV': '"development"',
      },
    },
  },
  envPrefix: ['AISA_', 'VITE_'],
  server: {
    host: true,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    reportCompressedSize: true,
    minify: 'esbuild',
    rollupOptions: {},
  },
});
