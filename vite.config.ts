import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// Dev-only image proxy: โหลดรูปต่าง origin ผ่าน server ตัวเอง
// เพื่อเลี่ยง CORS ตอน browser AI (face-api.js) อ่าน pixel
// ใช้: /img-proxy?url=<encoded image url>
async function handleImgProxy(req: IncomingMessage, res: ServerResponse) {
  try {
    const raw = (req as IncomingMessage & { originalUrl?: string }).originalUrl ?? req.url ?? '';
    const target = new URL(raw, 'http://localhost').searchParams.get('url');
    if (!target || !/^https?:\/\//i.test(target)) {
      res.statusCode = 400;
      res.end('missing ?url=');
      return;
    }
    const upstream = await fetch(target, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!upstream.ok) {
      res.statusCode = 502;
      res.end('fetch failed');
      return;
    }
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('cache-control', 'public, max-age=86400');
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    if (!res.writableEnded) {
      res.statusCode = 502;
      res.end('proxy error');
    }
  }
}

const imgProxy = (): Plugin => ({
  name: 'img-proxy',
  configureServer(server) {
    server.middlewares.use('/img-proxy', handleImgProxy);
  },
  // vite preview (npm run preview) ไม่ใช้ configureServer -> ต้องใส่เพิ่มไม่งั้น build แล้ว CORS แตก
  configurePreviewServer(server) {
    // @ts-ignore - preview server มี middlewares เหมือนกัน
    server.middlewares.use('/img-proxy', handleImgProxy);
  },
});

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths(),
    imgProxy()
  ],
})
