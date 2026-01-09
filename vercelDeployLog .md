19:34:01.985 Running build in Washington, D.C., USA (East) – iad1
19:34:02.003 Build machine configuration: 2 cores, 8 GB
19:34:02.409 Cloning github.com/codewithharz/glotrade_ecom (Branch: main, Commit: cebdf77)
19:34:04.388 Cloning completed: 1.979s
19:34:05.966 Restored build cache from previous deployment (J6FT9v9r4vHiHtiDsVFN83Xzchax)
19:34:06.844 Running "vercel build"
19:34:07.286 Vercel CLI 50.1.6
19:34:07.442 > Detected Turbo. Adjusting default settings...
19:34:07.691 Running "install" command: `npm install --prefix=../..`...
19:34:10.476 
19:34:10.477 up to date, audited 1178 packages in 3s
19:34:10.478 
19:34:10.481 271 packages are looking for funding
19:34:10.481   run `npm fund` for details
19:34:10.482 
19:34:10.482 1 high severity vulnerability
19:34:10.482 
19:34:10.482 To address all issues, run:
19:34:10.482   npm audit fix
19:34:10.482 
19:34:10.482 Run `npm audit` for details.
19:34:10.514 Detected Next.js version: 15.5.9
19:34:10.515 Running "cd ../.. && turbo run build --filter={apps/web}..."
19:34:10.605 
19:34:10.606 Attention:
19:34:10.606 Turborepo now collects completely anonymous telemetry regarding usage.
19:34:10.606 This information is used to shape the Turborepo roadmap and prioritize features.
19:34:10.606 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
19:34:10.606 https://turborepo.com/docs/telemetry
19:34:10.606 
19:34:10.631  WARNING  An issue occurred while attempting to parse /vercel/path0/yarn.lock. Turborepo will still function, but some features may not be available:
19:34:10.631    x Could not resolve workspaces.
19:34:10.631   `-> Lockfile not found at /vercel/path0/yarn.lock
19:34:10.631 
19:34:10.638 • Packages in scope: web
19:34:10.638 • Running build in 1 packages
19:34:10.638 • Remote caching enabled
19:34:10.879 web:build: cache miss, executing 5de811229aabc58b
19:34:11.118 web:build: yarn run v1.22.19
19:34:11.154 web:build: $ next build
19:34:12.246 web:build:  ⚠ Invalid next.config.ts options detected: 
19:34:12.247 web:build:  ⚠     Unrecognized key(s) in object: 'optimizeFonts'
19:34:12.247 web:build:  ⚠ See more info here: https://nextjs.org/docs/messages/invalid-next-config
19:34:12.342 web:build:    ▲ Next.js 15.5.9
19:34:12.343 web:build:    - Experiments (use with caution):
19:34:12.343 web:build:      · optimizePackageImports
19:34:12.344 web:build: 
19:34:12.511 web:build:    Creating an optimized production build ...
19:34:44.487 web:build:  ✓ Compiled successfully in 31.8s
19:34:44.492 web:build:    Skipping linting
19:34:44.493 web:build:    Checking validity of types ...
19:35:05.064 web:build:    Collecting page data ...
19:35:09.924 web:build:    Generating static pages (0/67) ...
19:35:11.281 web:build:    Generating static pages (16/67) 
19:35:11.895 web:build:    Generating static pages (33/67) 
19:35:12.185 web:build:    Generating static pages (50/67) 
19:35:12.365 web:build:  ✓ Generating static pages (67/67)
19:35:13.443 web:build:    Finalizing page optimization ...
19:35:13.444 web:build:    Collecting build traces ...
19:35:30.978 web:build: 
19:35:30.984 web:build: Route (app)                                 Size  First Load JS
19:35:30.984 web:build: ┌ ƒ /                                    5.02 kB         252 kB
19:35:30.984 web:build: ├ ƒ /_not-found                            995 B         103 kB
19:35:30.985 web:build: ├ ƒ /admin                               11.3 kB         190 kB
19:35:30.985 web:build: ├ ƒ /admin/analytics                     6.93 kB         186 kB
19:35:30.985 web:build: ├ ƒ /admin/banners                       5.66 kB         115 kB
19:35:30.985 web:build: ├ ƒ /admin/coupons                       8.82 kB         255 kB
19:35:30.985 web:build: ├ ƒ /admin/credit-requests               7.58 kB         117 kB
19:35:30.985 web:build: ├ ƒ /admin/gdip                          6.93 kB         118 kB
19:35:30.985 web:build: ├ ƒ /admin/gdip/commodities              4.27 kB         116 kB
19:35:30.985 web:build: ├ ƒ /admin/gdip/cycles                   5.39 kB         115 kB
19:35:30.985 web:build: ├ ƒ /admin/gdip/cycles/create            4.69 kB         107 kB
19:35:30.985 web:build: ├ ƒ /admin/gdip/gdc/[id]                  4.8 kB         114 kB
19:35:30.985 web:build: ├ ƒ /admin/gdip/gdcs                      4.8 kB         114 kB
19:35:30.985 web:build: ├ ƒ /admin/gdip/partners                 4.45 kB         114 kB
19:35:30.985 web:build: ├ ƒ /admin/gdip/tpias                    4.41 kB         115 kB
19:35:30.985 web:build: ├ ƒ /admin/orders                        9.43 kB         2.4 MB
19:35:30.985 web:build: ├ ƒ /admin/products                      5.93 kB         115 kB
19:35:30.985 web:build: ├ ƒ /admin/products/[id]                 5.49 kB        2.54 MB
19:35:30.986 web:build: ├ ƒ /admin/products/new                  6.91 kB         252 kB
19:35:30.986 web:build: ├ ƒ /admin/reports                       14.7 kB         124 kB
19:35:30.986 web:build: ├ ƒ /admin/sales-agents                  6.04 kB         115 kB
19:35:30.986 web:build: ├ ƒ /admin/security                      6.54 kB         118 kB
19:35:30.986 web:build: ├ ƒ /admin/settings                        13 kB         125 kB
19:35:30.986 web:build: ├ ƒ /admin/store                         8.31 kB         255 kB
19:35:30.986 web:build: ├ ƒ /admin/users                         11.7 kB         121 kB
19:35:30.990 web:build: ├ ƒ /admin/wallets                       11.3 kB         120 kB
19:35:30.991 web:build: ├ ƒ /admin/withdrawals                   7.71 kB         254 kB
19:35:30.991 web:build: ├ ƒ /agent/commissions                   5.12 kB         245 kB
19:35:30.991 web:build: ├ ƒ /agent/dashboard                     5.19 kB         245 kB
19:35:30.991 web:build: ├ ƒ /agent/referrals                     4.88 kB         245 kB
19:35:30.991 web:build: ├ ƒ /auth/forgot                         4.92 kB         248 kB
19:35:30.991 web:build: ├ ƒ /auth/login                          6.27 kB         250 kB
19:35:30.991 web:build: ├ ƒ /auth/reactivate                      4.2 kB         248 kB
19:35:30.991 web:build: ├ ƒ /auth/register                         591 B         241 kB
19:35:30.991 web:build: ├ ƒ /auth/register-business              6.61 kB         250 kB
19:35:30.991 web:build: ├ ƒ /auth/reset                          5.36 kB         249 kB
19:35:30.991 web:build: ├ ƒ /auth/verify                         3.86 kB         247 kB
19:35:30.991 web:build: ├ ƒ /best-selling                        1.49 kB         248 kB
19:35:30.994 web:build: ├ ƒ /cart                                4.55 kB        2.54 MB
19:35:30.994 web:build: ├ ƒ /checkout                            11.4 kB        2.54 MB
19:35:30.994 web:build: ├ ƒ /checkout/callback                   1.81 kB         242 kB
19:35:30.994 web:build: ├ ƒ /checkout/success                    2.43 kB         246 kB
19:35:30.994 web:build: ├ ƒ /dashboard                           8.77 kB         252 kB
19:35:30.994 web:build: ├ ƒ /gdip                                5.79 kB         246 kB
19:35:30.994 web:build: ├ ƒ /gdip/cycles                         5.62 kB         246 kB
19:35:30.994 web:build: ├ ƒ /gdip/purchase                       6.24 kB         246 kB
19:35:30.994 web:build: ├ ƒ /gdip/statement                      6.29 kB         246 kB
19:35:30.994 web:build: ├ ƒ /gdip/tpia/[id]                      5.92 kB         246 kB
19:35:30.995 web:build: ├ ƒ /gdip/tpia/[id]/certificate          14.4 kB         254 kB
19:35:30.995 web:build: ├ ƒ /gdip/tpia/[id]/commodity-backing    22.6 kB         263 kB
19:35:30.995 web:build: ├ ƒ /gdip/tpia/[id]/invoice              5.94 kB         246 kB
19:35:30.995 web:build: ├ ƒ /gdip/tpias                          4.87 kB         245 kB
19:35:30.996 web:build: ├ ○ /icon.png                                0 B            0 B
19:35:30.996 web:build: ├ ƒ /marketplace                           208 B         252 kB
19:35:30.996 web:build: ├ ƒ /marketplace/[id]                    9.12 kB         261 kB
19:35:30.996 web:build: ├ ƒ /orders                               7.1 kB         320 kB
19:35:30.996 web:build: ├ ƒ /orders/[id]                         6.13 kB         254 kB
19:35:30.996 web:build: ├ ƒ /profile                             17.4 kB        2.54 MB
19:35:30.997 web:build: ├ ƒ /profile/notifications               4.85 kB         247 kB
19:35:30.997 web:build: ├ ƒ /profile/reviews                     3.74 kB         110 kB
19:35:31.005 web:build: ├ ƒ /profile/vouchers                     7.7 kB         251 kB
19:35:31.005 web:build: ├ ƒ /profile/wallet                      18.2 kB         262 kB
19:35:31.005 web:build: ├ ƒ /profile/wallet/analytics            7.37 kB         247 kB
19:35:31.005 web:build: ├ ƒ /profile/wallet/callback             3.86 kB         244 kB
19:35:31.005 web:build: ├ ƒ /s/[slug]                            3.09 kB         255 kB
19:35:31.006 web:build: ├ ƒ /s/[slug]/about                        164 B         106 kB
19:35:31.006 web:build: ├ ƒ /security/fraud-cases                2.45 kB         246 kB
19:35:31.006 web:build: ├ ƒ /security/report                     2.19 kB         246 kB
19:35:31.006 web:build: ├ ƒ /security/report/communication       4.55 kB         248 kB
19:35:31.006 web:build: ├ ƒ /security/report/jobs                4.92 kB         248 kB
19:35:31.006 web:build: ├ ƒ /security/report/website             4.67 kB         248 kB
19:35:31.007 web:build: ├ ƒ /sitemap.xml                           125 B         103 kB
19:35:31.007 web:build: ├ ƒ /support                             4.68 kB         248 kB
19:35:31.007 web:build: ├ ƒ /verify/[id]                            4 kB         106 kB
19:35:31.007 web:build: ├ ƒ /wallet/share                        6.72 kB         247 kB
19:35:31.007 web:build: └ ƒ /wishlist                             3.5 kB         250 kB
19:35:31.007 web:build: + First Load JS shared by all             102 kB
19:35:31.007 web:build:   ├ chunks/18-ab8f8ad39fc5ebb0.js        46.2 kB
19:35:31.007 web:build:   ├ chunks/87c73c54-09e1ba5c70e60a51.js  54.2 kB
19:35:31.008 web:build:   └ other shared chunks (total)          1.95 kB
19:35:31.008 web:build: 
19:35:31.008 web:build: 
19:35:31.011 web:build: ○  (Static)   prerendered as static content
19:35:31.011 web:build: ƒ  (Dynamic)  server-rendered on demand
19:35:31.011 web:build: 
19:35:31.079 web:build: Done in 79.96s.
19:35:31.134 
19:35:31.134   Tasks:    1 successful, 1 total
19:35:31.135  Cached:    0 cached, 1 total
19:35:31.135    Time:    1m20.511s 
19:35:31.135 Summary:    /vercel/path0/.turbo/runs/3823F7OsWAuvayfxkPPmPmgJhYL.json
19:35:31.135 
19:35:35.173 Traced Next.js server files in: 69.131ms
19:35:35.580 Created all serverless functions in: 406.757ms
19:35:35.604 Collected static files (public/, static/, .next/static): 18.556ms
19:35:35.804 Build Completed in /vercel/output [1m]
19:35:36.005 Deploying outputs...