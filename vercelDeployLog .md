01:27:02.055 Running build in Portland, USA (West) – pdx1
01:27:02.056 Build machine configuration: 2 cores, 8 GB
01:27:02.165 Cloning github.com/harzjunior/glotrade_ecom (Branch: main, Commit: 471529d)
01:27:02.166 Previous build caches not available.
01:27:02.802 Cloning completed: 636.000ms
01:27:03.253 Running "vercel build"
01:27:03.682 Vercel CLI 49.0.0
01:27:03.836 > Detected Turbo. Adjusting default settings...
01:27:04.043 Running "install" command: `npm install --prefix=../..`...
01:27:07.851 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
01:27:08.558 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
01:27:08.618 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
01:27:09.393 npm warn deprecated @types/dotenv@8.2.3: This is a stub types definition. dotenv provides its own type definitions, so you do not need this installed.
01:27:09.802 npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
01:27:09.866 npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
01:27:18.349 npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
01:27:25.547 
01:27:25.549 added 1115 packages, and audited 1118 packages in 21s
01:27:25.550 
01:27:25.550 264 packages are looking for funding
01:27:25.550   run `npm fund` for details
01:27:25.624 
01:27:25.624 2 vulnerabilities (1 high, 1 critical)
01:27:25.624 
01:27:25.624 To address issues that do not require attention, run:
01:27:25.624   npm audit fix
01:27:25.624 
01:27:25.625 To address all issues, run:
01:27:25.625   npm audit fix --force
01:27:25.625 
01:27:25.625 Run `npm audit` for details.
01:27:25.705 Detected Next.js version: 15.0.4
01:27:25.705 Running "cd ../.. && turbo run build --filter={apps/web}..."
01:27:25.759 
01:27:25.759 Attention:
01:27:25.760 Turborepo now collects completely anonymous telemetry regarding usage.
01:27:25.760 This information is used to shape the Turborepo roadmap and prioritize features.
01:27:25.760 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
01:27:25.760 https://turborepo.com/docs/telemetry
01:27:25.760 
01:27:25.822  WARNING  An issue occurred while attempting to parse /vercel/path0/yarn.lock. Turborepo will still function, but some features may not be available:
01:27:25.827    x Could not resolve workspaces.
01:27:25.827   `-> Lockfile not found at /vercel/path0/yarn.lock
01:27:25.827 
01:27:25.828 • Packages in scope: web
01:27:25.828 • Running build in 1 packages
01:27:25.828 • Remote caching enabled
01:27:26.168 web:build: cache miss, executing 87f754d92355a620
01:27:26.430 web:build: yarn run v1.22.19
01:27:26.464 web:build: $ next build
01:27:27.083 web:build: Attention: Next.js now collects completely anonymous telemetry regarding usage.
01:27:27.084 web:build: This information is used to shape Next.js' roadmap and prioritize features.
01:27:27.085 web:build: You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
01:27:27.085 web:build: https://nextjs.org/telemetry
01:27:27.085 web:build: 
01:27:27.151 web:build:    ▲ Next.js 15.0.4
01:27:27.152 web:build: 
01:27:27.175 web:build:    Creating an optimized production build ...
01:27:54.488 web:build:  ✓ Compiled successfully
01:27:54.490 web:build:    Skipping linting
01:27:54.490 web:build:    Checking validity of types ...
01:28:08.511 web:build:    Collecting page data ...
01:28:11.840 web:build:    Generating static pages (0/50) ...
01:28:13.041 web:build:    Generating static pages (12/50) 
01:28:13.257 web:build:    Generating static pages (24/50) 
01:28:13.419 web:build: AddressCard: Received address prop: null
01:28:13.419 web:build: AddressCard: displayName value: undefined
01:28:13.659 web:build:    Generating static pages (37/50) 
01:28:13.887 web:build:  ✓ Generating static pages (50/50)
01:28:14.656 web:build:    Finalizing page optimization ...
01:28:14.657 web:build:    Collecting build traces ...
01:28:26.198 web:build: 
01:28:26.202 web:build: Route (app)                              Size     First Load JS
01:28:26.203 web:build: ┌ ƒ /                                    4.27 kB         118 kB
01:28:26.203 web:build: ├ ○ /_not-found                          904 B           101 kB
01:28:26.203 web:build: ├ ○ /admin                               11.4 kB         194 kB
01:28:26.203 web:build: ├ ○ /admin/analytics                     6.96 kB         189 kB
01:28:26.203 web:build: ├ ○ /admin/banners                       5.7 kB          118 kB
01:28:26.203 web:build: ├ ○ /admin/coupons                       8.38 kB         121 kB
01:28:26.203 web:build: ├ ○ /admin/credit-requests               7.61 kB         120 kB
01:28:26.203 web:build: ├ ○ /admin/orders                        9.97 kB         123 kB
01:28:26.203 web:build: ├ ○ /admin/products                      5.99 kB         119 kB
01:28:26.204 web:build: ├ ƒ /admin/products/[id]                 2.55 kB         118 kB
01:28:26.204 web:build: ├ ○ /admin/products/new                  6.26 kB         112 kB
01:28:26.204 web:build: ├ ○ /admin/reports                       14.8 kB         127 kB
01:28:26.204 web:build: ├ ○ /admin/security                      6.15 kB         122 kB
01:28:26.204 web:build: ├ ○ /admin/settings                      15.2 kB         128 kB
01:28:26.204 web:build: ├ ○ /admin/store                         7.83 kB         121 kB
01:28:26.204 web:build: ├ ○ /admin/users                         9.11 kB         125 kB
01:28:26.204 web:build: ├ ○ /admin/wallets                       11.4 kB         124 kB
01:28:26.204 web:build: ├ ○ /admin/withdrawals                   7.24 kB         120 kB
01:28:26.204 web:build: ├ ○ /auth/forgot                         4.55 kB         114 kB
01:28:26.204 web:build: ├ ○ /auth/login                          5.95 kB         115 kB
01:28:26.205 web:build: ├ ○ /auth/reactivate                     3.9 kB          113 kB
01:28:26.205 web:build: ├ ○ /auth/register                       5.03 kB         114 kB
01:28:26.205 web:build: ├ ○ /auth/register-business              6.15 kB         115 kB
01:28:26.207 web:build: ├ ○ /auth/reset                          4.92 kB         114 kB
01:28:26.207 web:build: ├ ○ /auth/verify                         3.92 kB         113 kB
01:28:26.207 web:build: ├ ƒ /best-selling                        769 B           114 kB
01:28:26.207 web:build: ├ ○ /cart                                6.3 kB          128 kB
01:28:26.207 web:build: ├ ○ /checkout                            12.8 kB         130 kB
01:28:26.207 web:build: ├ ○ /checkout/callback                   1.76 kB         102 kB
01:28:26.208 web:build: ├ ○ /checkout/success                    2.42 kB         112 kB
01:28:26.208 web:build: ├ ○ /dashboard                           8.54 kB         118 kB
01:28:26.208 web:build: ├ ƒ /marketplace                         211 B           118 kB
01:28:26.208 web:build: ├ ƒ /marketplace/[id]                    9.01 kB         127 kB
01:28:26.208 web:build: ├ ○ /orders                              7.02 kB         186 kB
01:28:26.208 web:build: ├ ƒ /orders/[id]                         6.91 kB         120 kB
01:28:26.208 web:build: ├ ○ /profile                             17.6 kB         127 kB
01:28:26.208 web:build: ├ ○ /profile/notifications               4.83 kB         107 kB
01:28:26.209 web:build: ├ ○ /profile/reviews                     3.79 kB         113 kB
01:28:26.209 web:build: ├ ○ /profile/vouchers                    7.3 kB          117 kB
01:28:26.209 web:build: ├ ○ /profile/wallet                      15.6 kB         125 kB
01:28:26.209 web:build: ├ ○ /profile/wallet/analytics            7 kB            107 kB
01:28:26.209 web:build: ├ ○ /profile/wallet/callback             3.94 kB         104 kB
01:28:26.209 web:build: ├ ƒ /s/[slug]                            3.12 kB         121 kB
01:28:26.209 web:build: ├ ƒ /s/[slug]/about                      182 B           110 kB
01:28:26.209 web:build: ├ ○ /security/fraud-cases                182 B           110 kB
01:28:26.209 web:build: ├ ○ /security/report                     182 B           110 kB
01:28:26.210 web:build: ├ ○ /security/report/communication       4.96 kB         114 kB
01:28:26.210 web:build: ├ ○ /security/report/jobs                5.52 kB         115 kB
01:28:26.210 web:build: ├ ○ /security/report/website             5.13 kB         114 kB
01:28:26.210 web:build: ├ ○ /support                             5.02 kB         114 kB
01:28:26.210 web:build: ├ ○ /wallet/share                        6.27 kB         106 kB
01:28:26.210 web:build: └ ○ /wishlist                            4.16 kB         118 kB
01:28:26.210 web:build: + First Load JS shared by all            100 kB
01:28:26.210 web:build:   ├ chunks/2855-689bf6247a04d105.js      45.8 kB
01:28:26.210 web:build:   ├ chunks/87c73c54-a07354ebeef3e537.js  52.5 kB
01:28:26.210 web:build:   └ other shared chunks (total)          1.93 kB
01:28:26.210 web:build: 
01:28:26.210 web:build: 
01:28:26.211 web:build: ○  (Static)   prerendered as static content
01:28:26.211 web:build: ƒ  (Dynamic)  server-rendered on demand
01:28:26.211 web:build: 
01:28:26.252 web:build: Done in 59.82s.
01:28:26.305 
01:28:26.305   Tasks:    1 successful, 1 total
01:28:26.306  Cached:    0 cached, 1 total
01:28:26.306    Time:    1m0.497s 
01:28:26.306 Summary:    /vercel/path0/.turbo/runs/36RsqDmYax6OL2ejVyVda6ohJQ7.json
01:28:26.306 
01:28:28.761 Traced Next.js server files in: 116.04ms
01:28:28.960 Created all serverless functions in: 198.842ms
01:28:28.979 Collected static files (public/, static/, .next/static): 12.134ms
01:28:29.179 Build Completed in /vercel/output [1m]
01:28:29.424 Deploying outputs...