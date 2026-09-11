import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

export default defineConfig(async () => {
  // Keep the dedicated Vercel bundle available for users who deploy there.
  const isVercel = process.env.VERCEL === '1' || process.env.NITRO_PRESET === 'vercel';

  if (isVercel) {
    const { nitro } = await import('nitro/vite');

    return {
      css: { postcss: { plugins: [tailwindcss()] } },
      plugins: [vinext(), nitro()],
    };
  }

  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [vinext()],
  };
});
