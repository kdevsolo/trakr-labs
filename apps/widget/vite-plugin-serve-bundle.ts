import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const BUNDLE_PATH = '/trakr-widget.js';

export function serveWidgetBundleInDev(): Plugin {
  return {
    name: 'serve-widget-bundle-in-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url !== BUNDLE_PATH) {
          next();
          return;
        }

        const fileName = url.slice(1);
        const bundleFile = path.resolve(server.config.root, 'dist', fileName);

        if (!fs.existsSync(bundleFile)) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(
            [
              `${fileName} not found.`,
              'Run: pnpm --filter @trakr/widget build',
              'Or restart dev — it builds the bundle automatically.',
            ].join('\n'),
          );
          return;
        }

        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        fs.createReadStream(bundleFile).pipe(res);
      });
    },
  };
}
