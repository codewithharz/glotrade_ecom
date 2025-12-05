# Render Deployment Guide for Monorepo

## Issue: Render Cannot Find Files

The error you're seeing happens because Render is trying to use Docker, but the Dockerfile paths assume it's being built from the `apps/api` directory, when actually Render builds from the repository root.

## Solution: Use Native Node.js Build (Recommended)

**Don't use Docker on Render.** Instead, configure Render to use native Node.js:

### Render Dashboard Configuration:

1. **Root Directory**: Leave empty (build from repo root)
2. **Build Command**:
   ```bash
   yarn install && cd apps/api && yarn build
   ```

3. **Start Command**:
   ```bash
   cd apps/api && node dist/index.js
   ```

4. **Environment**: Node

### Alternative: If Using Turbo

If you're using Turborepo (you have `turbo.json`), use:

**Build Command**:
```bash
yarn install && yarn turbo run build --filter=api
```

**Start Command**:
```bash
cd apps/api && node dist/index.js
```

## Verify Your package.json

Make sure `apps/api/package.json` has:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn src/index.ts"
  }
}
```

## Docker Alternative (If You Really Need It)

If you must use Docker on Render:

1. **Dockerfile Location**: Keep at `apps/api/Dockerfile`
2. **Docker Build Context**: Set to repository root (`.`)
3. **Dockerfile Path**: `apps/api/Dockerfile`

But this is more complex and not recommended for Render.

## Quick Fix Steps:

1. Go to Render Dashboard → Your Service → Settings
2. Change **Build Command** to:
   ```
   yarn install && cd apps/api && yarn build
   ```
3. Change **Start Command** to:
   ```
   cd apps/api && node dist/index.js
   ```
4. **Save Changes**
5. **Manual Deploy** → Deploy latest commit

This should work immediately!
