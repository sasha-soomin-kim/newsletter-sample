import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: false,
    // 기본 exclude에 .claude(다른 세션 worktree)와 .superpowers 추가
    exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/**', '**/.superpowers/**'],
  },
});
