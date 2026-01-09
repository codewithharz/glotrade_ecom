# Performance Optimization Guide for GloTrade

## Overview
This document provides guidelines for maintaining optimal performance on the GloTrade platform, particularly for images and content loading.

## Image Optimization Best Practices

### 1. Product Images
**Requirements:**
- Format: WebP or AVIF (fallback to JPEG)
- Max file size: 100KB per image
- Dimensions: 800x800px for product listings, 1200x1200px for detail pages
- Compression: 80-85% quality

**Tools for Compression:**
- [Squoosh](https://squoosh.app/) - Web-based
- [ImageOptim](https://imageoptim.com/) - Mac app
- [TinyPNG](https://tinypng.com/) - Web-based

### 2. Hero/Banner Images
**Requirements:**
- Format: WebP with JPEG fallback
- Max file size: 150KB
- Dimensions: 1920x600px (desktop), 768x400px (mobile)
- Use `priority` prop in Next.js Image component

**Example:**
\`\`\`tsx
import Image from 'next/image';

<Image
  src="/hero-banner.webp"
  alt="Hero Banner"
  width={1920}
  height={600}
  priority // Loads immediately for LCP
  quality={85}
/>
\`\`\`

### 3. Lazy Loading for Below-Fold Images
For images not immediately visible:

\`\`\`tsx
<Image
  src="/product-image.webp"
  alt="Product"
  width={800}
  height={800}
  loading="lazy" // Default behavior
  quality={80}
/>
\`\`\`

## Performance Targets

### Desktop
- **Performance Score**: 90+
- **FCP (First Contentful Paint)**: < 1.0s
- **LCP (Largest Contentful Paint)**: < 2.0s
- **TBT (Total Blocking Time)**: < 200ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Mobile
- **Performance Score**: 75+
- **FCP**: < 1.8s
- **LCP**: < 3.0s
- **TBT**: < 300ms
- **CLS**: < 0.1

## Current Optimizations Implemented

### Build Configuration
✅ SWC minification enabled
✅ Gzip compression enabled
✅ Console.log removal in production
✅ Production source maps disabled
✅ Package import optimization (lucide-react, chart.js)

### Image Configuration
✅ AVIF and WebP format support
✅ Optimized device sizes
✅ Minimum cache TTL: 60 seconds

### Font Optimization
✅ Font-display: swap on all fonts
✅ Variable fonts (Geist Sans, Geist Mono)
✅ Google Fonts (Poppins) with swap

### Network Optimization
✅ Preconnect to API domain
✅ DNS prefetch for external resources

## Monitoring Performance

### Tools
1. **PageSpeed Insights**: https://pagespeed.web.dev/
2. **Lighthouse** (Chrome DevTools)
3. **WebPageTest**: https://www.webpagetest.org/

### What to Monitor
- Core Web Vitals (LCP, FID, CLS)
- Total Blocking Time
- First Contentful Paint
- Speed Index

### Testing Checklist
- [ ] Test on desktop (Chrome, Safari, Firefox)
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Test with slow 3G network throttling
- [ ] Test with disabled JavaScript
- [ ] Verify images load with proper formats

## Image Upload Workflow for Vendors

### Before Upload
1. **Resize** images to required dimensions
2. **Compress** using recommended tools
3. **Convert** to WebP format
4. **Verify** file size is under limits

### During Upload
- Platform automatically generates multiple sizes
- AVIF format created for modern browsers
- WebP format for broad compatibility
- JPEG fallback for older browsers

### After Upload
- Images served via Next.js Image component
- Automatic lazy loading for below-fold
- Responsive images with srcset
- Optimized caching headers

## Common Issues & Solutions

### Issue: Large LCP (> 3s)
**Solution:**
- Compress hero/banner images
- Add `priority` prop to above-fold images
- Use WebP/AVIF formats

### Issue: High TBT (> 300ms)
**Solution:**
- Reduce JavaScript bundle size
- Implement code splitting
- Defer non-critical scripts

### Issue: Layout Shift (CLS > 0.1)
**Solution:**
- Always specify width/height for images
- Reserve space for dynamic content
- Use font-display: swap

## Vercel Deployment Optimizations

### Caching Strategy
- Static assets: 1 year cache
- Images: 1 day browser cache, 1 year CDN cache
- HTML: No cache (always fresh)

### Serverless Functions
- Max duration: 10 seconds
- Region: iad1 (Washington, D.C.)
- Automatic edge caching

## Next Steps for Vendors

### Image Preparation Checklist
- [ ] Compress all product images to < 100KB
- [ ] Convert to WebP format
- [ ] Resize to 800x800px (listings) or 1200x1200px (details)
- [ ] Test image quality at 80-85% compression
- [ ] Batch process using recommended tools

### Expected Results After Image Optimization
- Desktop Performance: 90+ (currently 86)
- Mobile Performance: 75-80+ (currently 65)
- LCP improvement: 30-40%
- Bandwidth savings: 60-70%

## Resources

### Compression Tools
- Squoosh: https://squoosh.app/
- ImageOptim: https://imageoptim.com/
- TinyPNG: https://tinypng.com/
- Sharp (CLI): https://sharp.pixelplumbing.com/

### Testing Tools
- PageSpeed Insights: https://pagespeed.web.dev/
- Lighthouse: Chrome DevTools
- WebPageTest: https://www.webpagetest.org/

### Documentation
- Next.js Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images
- Web Vitals: https://web.dev/vitals/
- Image Formats: https://web.dev/choose-the-right-image-format/
