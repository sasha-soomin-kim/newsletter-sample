import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 서브경로(예: /memo-app/)에서도 동일하게 동작하도록 상대 경로 사용.
// 로컬 dev (`/`)와 Pages (`/repo-name/`) 양쪽 모두 무설정으로 호환됩니다.
export default defineConfig({
  plugins: [react()],
  base: './',
});
