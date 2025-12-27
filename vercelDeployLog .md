22:53:34.195 Running build in Portland, USA (West) – pdx1
22:53:34.195 Build machine configuration: 2 cores, 8 GB
22:53:34.312 Cloning github.com/harzjunior/glotrade_ecom (Branch: main, Commit: 7b3115a)
22:53:35.607 Cloning completed: 1.295s
22:53:35.797 Restored build cache from previous deployment (2QciwntKh5PDTkbphRm32QXU2uzG)
22:53:36.911 Running "vercel build"
22:53:37.399 Vercel CLI 50.1.3
22:53:37.555 > Detected Turbo. Adjusting default settings...
22:53:37.848 Running "install" command: `npm install --prefix=../..`...
22:53:40.339 
22:53:40.341 up to date, audited 1120 packages in 2s
22:53:40.341 
22:53:40.341 265 packages are looking for funding
22:53:40.342   run `npm fund` for details
22:53:40.342 
22:53:40.342 found 0 vulnerabilities
22:53:40.374 Detected Next.js version: 15.5.9
22:53:40.375 Running "cd ../.. && turbo run build --filter={apps/web}..."
22:53:40.472 
22:53:40.472 Attention:
22:53:40.472 Turborepo now collects completely anonymous telemetry regarding usage.
22:53:40.473 This information is used to shape the Turborepo roadmap and prioritize features.
22:53:40.473 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
22:53:40.473 https://turborepo.com/docs/telemetry
22:53:40.473 
22:53:40.499  WARNING  An issue occurred while attempting to parse /vercel/path0/yarn.lock. Turborepo will still function, but some features may not be available:
22:53:40.500    x Could not resolve workspaces.
22:53:40.500   `-> Lockfile not found at /vercel/path0/yarn.lock
22:53:40.500 
22:53:40.506 • Packages in scope: web
22:53:40.506 • Running build in 1 packages
22:53:40.506 • Remote caching enabled
22:53:41.062 web:build: cache miss, executing bf5dbb22f9db6a26
22:53:41.628 web:build: yarn run v1.22.19
22:53:41.659 web:build: $ next build
22:53:42.786 web:build:    ▲ Next.js 15.5.9
22:53:42.787 web:build: 
22:53:42.922 web:build:    Creating an optimized production build ...
22:53:56.520 web:build:  ✓ Compiled successfully in 10.9s
22:53:56.523 web:build:    Skipping linting
22:53:56.524 web:build:    Checking validity of types ...
22:54:14.153 web:build:    Collecting page data ...
22:54:18.416 web:build:    Generating static pages (0/68) ...
22:54:19.285 web:build: Error fetching products for sitemap: [Error: Dynamic server usage: Route /sitemap.xml couldn't be rendered statically because it used revalidate: 0 fetch https://glotrade-ecom.onrender.com/api/v1/market/products?limit=1000 /sitemap.xml. See more info here: https://nextjs.org/docs/messages/dynamic-server-error] {
22:54:19.286 web:build:   description: "Route /sitemap.xml couldn't be rendered statically because it used revalidate: 0 fetch https://glotrade-ecom.onrender.com/api/v1/market/products?limit=1000 /sitemap.xml. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
22:54:19.286 web:build:   digest: 'DYNAMIC_SERVER_USAGE'
22:54:19.286 web:build: }
22:54:19.287 web:build: Error fetching categories for sitemap: [Error: Dynamic server usage: Route /sitemap.xml couldn't be rendered statically because it used no-store fetch https://glotrade-ecom.onrender.com/api/v1/categories /sitemap.xml. See more info here: https://nextjs.org/docs/messages/dynamic-server-error] {
22:54:19.287 web:build:   description: "Route /sitemap.xml couldn't be rendered statically because it used no-store fetch https://glotrade-ecom.onrender.com/api/v1/categories /sitemap.xml. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
22:54:19.287 web:build:   digest: 'DYNAMIC_SERVER_USAGE'
22:54:19.287 web:build: }
22:54:20.215 web:build:    Generating static pages (17/68) 
22:54:20.626 web:build:    Generating static pages (34/68) 
22:54:20.805 web:build: AddressCard: Received address prop: null
22:54:20.806 web:build: AddressCard: displayName value: undefined
22:54:21.124 web:build:    Generating static pages (51/68) 
22:54:21.305 web:build:  ✓ Generating static pages (68/68)
22:54:22.406 web:build:    Finalizing page optimization ...
22:54:22.407 web:build:    Collecting build traces ...
22:54:38.983 web:build: 
22:54:38.989 web:build: Route (app)                                 Size  First Load JS
22:54:38.989 web:build: ┌ ƒ /                                    4.98 kB         114 kB
22:54:38.989 web:build: ├ ○ /_not-found                            995 B         103 kB
22:54:38.989 web:build: ├ ○ /admin                               11.4 kB         190 kB
22:54:38.989 web:build: ├ ○ /admin/analytics                     6.93 kB         186 kB
22:54:38.990 web:build: ├ ○ /admin/banners                       5.66 kB         115 kB
22:54:38.990 web:build: ├ ○ /admin/coupons                       8.34 kB         118 kB
22:54:38.990 web:build: ├ ○ /admin/credit-requests               7.58 kB         117 kB
22:54:38.990 web:build: ├ ○ /admin/gdip                          6.93 kB         118 kB
22:54:38.990 web:build: ├ ○ /admin/gdip/commodities              4.27 kB         116 kB
22:54:38.991 web:build: ├ ○ /admin/gdip/cycles                   5.39 kB         115 kB
22:54:38.991 web:build: ├ ○ /admin/gdip/cycles/create            4.69 kB         107 kB
22:54:38.991 web:build: ├ ƒ /admin/gdip/gdc/[id]                  4.8 kB         114 kB
22:54:38.991 web:build: ├ ○ /admin/gdip/gdcs                      4.8 kB         114 kB
22:54:38.991 web:build: ├ ○ /admin/gdip/partners                 4.45 kB         114 kB
22:54:38.991 web:build: ├ ○ /admin/gdip/tpias                    4.41 kB         116 kB
22:54:38.991 web:build: ├ ○ /admin/orders                        9.43 kB         2.4 MB
22:54:38.992 web:build: ├ ○ /admin/products                      5.93 kB         115 kB
22:54:38.992 web:build: ├ ƒ /admin/products/[id]                 2.52 kB         114 kB
22:54:38.992 web:build: ├ ○ /admin/products/new                  6.21 kB         114 kB
22:54:38.992 web:build: ├ ○ /admin/reports                       14.7 kB         124 kB
22:54:38.992 web:build: ├ ○ /admin/sales-agents                  6.04 kB         115 kB
22:54:38.993 web:build: ├ ○ /admin/security                      6.56 kB         118 kB
22:54:38.993 web:build: ├ ○ /admin/settings                        13 kB         125 kB
22:54:38.993 web:build: ├ ○ /admin/store                         7.84 kB         117 kB
22:54:38.993 web:build: ├ ○ /admin/users                         11.7 kB         121 kB
22:54:38.993 web:build: ├ ○ /admin/wallets                       11.3 kB         121 kB
22:54:38.993 web:build: ├ ○ /admin/withdrawals                   7.23 kB         116 kB
22:54:38.994 web:build: ├ ○ /agent/commissions                   5.06 kB         108 kB
22:54:38.994 web:build: ├ ○ /agent/dashboard                     5.18 kB         108 kB
22:54:38.995 web:build: ├ ○ /agent/referrals                     4.83 kB         107 kB
22:54:38.995 web:build: ├ ○ /auth/forgot                         4.49 kB         110 kB
22:54:38.995 web:build: ├ ○ /auth/login                          5.93 kB         112 kB
22:54:38.995 web:build: ├ ○ /auth/reactivate                     3.87 kB         110 kB
22:54:38.995 web:build: ├ ○ /auth/register                         570 B         103 kB
22:54:38.996 web:build: ├ ○ /auth/register-business              6.21 kB         112 kB
22:54:38.996 web:build: ├ ○ /auth/reset                          4.88 kB         111 kB
22:54:38.996 web:build: ├ ○ /auth/verify                         3.89 kB         110 kB
22:54:38.996 web:build: ├ ƒ /best-selling                        1.45 kB         111 kB
22:54:38.996 web:build: ├ ○ /cart                                6.15 kB         2.4 MB
22:54:38.996 web:build: ├ ○ /checkout                            12.5 kB        2.41 MB
22:54:38.996 web:build: ├ ○ /checkout/callback                   1.75 kB         104 kB
22:54:38.996 web:build: ├ ○ /checkout/success                    2.41 kB         108 kB
22:54:38.996 web:build: ├ ○ /dashboard                           8.47 kB         114 kB
22:54:38.996 web:build: ├ ○ /gdip                                 5.8 kB         108 kB
22:54:38.996 web:build: ├ ○ /gdip/cycles                         5.69 kB         108 kB
22:54:38.997 web:build: ├ ○ /gdip/purchase                       6.47 kB         109 kB
22:54:38.997 web:build: ├ ○ /gdip/statement                      6.62 kB         109 kB
22:54:38.997 web:build: ├ ƒ /gdip/tpia/[id]                      5.97 kB         108 kB
22:54:38.997 web:build: ├ ƒ /gdip/tpia/[id]/certificate          14.6 kB         117 kB
22:54:38.997 web:build: ├ ƒ /gdip/tpia/[id]/commodity-backing    22.6 kB         125 kB
22:54:38.997 web:build: ├ ƒ /gdip/tpia/[id]/invoice              6.16 kB         109 kB
22:54:38.997 web:build: ├ ○ /gdip/tpias                          5.02 kB         108 kB
22:54:38.997 web:build: ├ ○ /icon.png                                0 B            0 B
22:54:38.997 web:build: ├ ƒ /marketplace                           197 B         114 kB
22:54:38.997 web:build: ├ ƒ /marketplace/[id]                    9.12 kB         123 kB
22:54:38.997 web:build: ├ ○ /orders                              6.97 kB         182 kB
22:54:38.998 web:build: ├ ƒ /orders/[id]                         6.14 kB         117 kB
22:54:38.998 web:build: ├ ○ /profile                             17.9 kB        2.41 MB
22:54:38.998 web:build: ├ ○ /profile/notifications               4.79 kB         110 kB
22:54:38.998 web:build: ├ ○ /profile/reviews                     3.74 kB         110 kB
22:54:38.998 web:build: ├ ○ /profile/vouchers                    7.29 kB         113 kB
22:54:38.998 web:build: ├ ○ /profile/wallet                      18.1 kB         124 kB
22:54:38.998 web:build: ├ ○ /profile/wallet/analytics            6.96 kB         109 kB
22:54:38.999 web:build: ├ ○ /profile/wallet/callback             3.92 kB         106 kB
22:54:38.999 web:build: ├ ƒ /s/[slug]                            3.09 kB         117 kB
22:54:38.999 web:build: ├ ƒ /s/[slug]/about                        172 B         106 kB
22:54:38.999 web:build: ├ ○ /security/fraud-cases                  172 B         106 kB
22:54:38.999 web:build: ├ ○ /security/report                       172 B         106 kB
22:54:39.000 web:build: ├ ○ /security/report/communication       4.93 kB         111 kB
22:54:39.000 web:build: ├ ○ /security/report/jobs                 5.5 kB         111 kB
22:54:39.000 web:build: ├ ○ /security/report/website              5.1 kB         111 kB
22:54:39.000 web:build: ├ ƒ /sitemap.xml                           125 B         103 kB
22:54:39.001 web:build: ├ ○ /support                             5.01 kB         111 kB
22:54:39.001 web:build: ├ ƒ /verify/[id]                            4 kB         106 kB
22:54:39.001 web:build: ├ ○ /wallet/share                        6.27 kB         109 kB
22:54:39.001 web:build: └ ○ /wishlist                            4.82 kB         114 kB
22:54:39.001 web:build: + First Load JS shared by all             102 kB
22:54:39.001 web:build:   ├ chunks/18-fbfedcf97afe59e2.js        46.3 kB
22:54:39.001 web:build:   ├ chunks/87c73c54-09e1ba5c70e60a51.js  54.2 kB
22:54:39.001 web:build:   └ other shared chunks (total)          1.94 kB
22:54:39.001 web:build: 
22:54:39.001 web:build: 
22:54:39.002 web:build: ○  (Static)   prerendered as static content
22:54:39.002 web:build: ƒ  (Dynamic)  server-rendered on demand
22:54:39.002 web:build: 
22:54:39.049 web:build: Done in 57.42s.
22:54:39.106 
22:54:39.106   Tasks:    1 successful, 1 total
22:54:39.106  Cached:    0 cached, 1 total
22:54:39.106    Time:    58.617s 
22:54:39.107 Summary:    /vercel/path0/.turbo/runs/37OtjOsBtHDKYTI63NgvZ7RQtyz.json
22:54:39.107 
22:54:46.258  WARNING  failed to contact remote cache: Error making HTTP request: HTTP status client error (400 Bad Request) for url (https://vercel.com/api/v8/artifacts/bf5dbb22f9db6a26?teamId=team_noBptpFqmCqx0bzrcOJSq6TI)
22:54:46.501 Traced Next.js server files in: 75.303ms
22:54:46.886 Created all serverless functions in: 384.906ms
22:54:46.911 Collected static files (public/, static/, .next/static): 16.722ms
22:54:47.213 Build Completed in /vercel/output [1m]
22:54:47.591 Deploying outputs...
22:55:00.457 Deployment completed
22:55:01.406 Creating build cache...
22:55:40.323 Created build cache: 38.914s
22:55:40.323 Uploading build cache [307.92 MB]
22:55:44.346 Build cache uploaded: 4.025s