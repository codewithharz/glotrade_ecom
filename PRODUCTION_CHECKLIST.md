# Production Deployment Checklist

Use this checklist before deploying to production to ensure everything is configured correctly.

## 📋 Pre-Deployment

### Code & Repository
- [ ] All code committed to git
- [ ] No sensitive data in repository
- [ ] `.env` files in `.gitignore`
- [ ] `README.md` updated with deployment info
- [ ] All tests passing locally
- [ ] No console.log statements in production code
- [ ] Error handling implemented for all critical paths

### Environment Variables
- [ ] `JWT_SECRET` generated (min 32 characters, random)
- [ ] `MONGODB_URI` configured
- [ ] Payment provider keys obtained (Paystack, Flutterwave)
- [ ] `FRONTEND_URL` set correctly
- [ ] `NEXT_PUBLIC_API_URL` set correctly
- [ ] All required env vars documented in `.env.example`

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with appropriate permissions
- [ ] Network access configured (allow from anywhere or specific IPs)
- [ ] Connection string tested
- [ ] Indexes created for frequently queried fields
- [ ] Backup strategy planned

### Security
- [ ] JWT secret is strong and unique
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled on API endpoints
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS protection enabled
- [ ] HTTPS enforced (automatic on Render/Vercel)
- [ ] Helmet.js configured for security headers
- [ ] Payment webhook signatures verified
- [ ] Sensitive routes protected with authentication

---

## 🚀 Deployment Steps

### Backend (Render)
- [ ] Render account created
- [ ] Repository connected to Render
- [ ] Web service created
- [ ] Build command configured: `yarn install && yarn build`
- [ ] Start command configured: `yarn start`
- [ ] All environment variables added
- [ ] Health check endpoint configured: `/health`
- [ ] Auto-deploy enabled
- [ ] Initial deployment successful
- [ ] Backend URL copied: `https://______.onrender.com`

### Frontend (Vercel)
- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] Project imported
- [ ] Root directory set to `apps/web`
- [ ] `NEXT_PUBLIC_API_URL` environment variable added
- [ ] Initial deployment successful
- [ ] Frontend URL copied: `https://______.vercel.app`

### Post-Deployment Configuration
- [ ] CORS updated in backend to include Vercel domain
- [ ] Backend redeployed after CORS update
- [ ] Super admin account created
- [ ] Test login with super admin
- [ ] Test product creation
- [ ] Test order placement
- [ ] Test payment flow (sandbox mode)

---

## ✅ Functionality Testing

### Authentication
- [ ] User registration works
- [ ] Email verification works (if enabled)
- [ ] Login works
- [ ] Logout works
- [ ] Password reset works (if enabled)
- [ ] JWT token refresh works
- [ ] Protected routes require authentication

### Products
- [ ] Product listing loads
- [ ] Product search works
- [ ] Product filtering works
- [ ] Product details page loads
- [ ] Product images display correctly
- [ ] Add to cart works
- [ ] Bulk pricing tiers display correctly

### Cart & Checkout
- [ ] Add to cart works
- [ ] Update cart quantity works
- [ ] Remove from cart works
- [ ] Cart persists across sessions
- [ ] Checkout flow works
- [ ] Address selection/creation works
- [ ] Payment methods display

### Orders
- [ ] Order creation works
- [ ] Order confirmation email sent (if enabled)
- [ ] Order details page loads
- [ ] Order status updates work
- [ ] Order history displays

### Admin Panel
- [ ] Admin login works
- [ ] Product management works (CRUD)
- [ ] Order management works
- [ ] User management works
- [ ] Analytics dashboard loads
- [ ] Settings can be updated

### Payments
- [ ] Paystack integration works (sandbox)
- [ ] Flutterwave integration works (sandbox)
- [ ] Wallet payment works
- [ ] Payment webhooks received
- [ ] Order status updates after payment

---

## 🔍 Performance Testing

### Backend
- [ ] API response time < 500ms for most endpoints
- [ ] Database queries optimized with indexes
- [ ] No N+1 query problems
- [ ] Pagination implemented for large datasets
- [ ] Compression enabled
- [ ] Caching strategy implemented (if needed)

### Frontend
- [ ] Page load time < 3 seconds
- [ ] Images optimized (using Next.js Image)
- [ ] Code splitting enabled (automatic with Next.js)
- [ ] Lighthouse score > 80 for Performance
- [ ] No console errors in browser
- [ ] Mobile responsive design verified

---

## 📊 Monitoring Setup

### Render
- [ ] Health check configured
- [ ] Deploy notifications enabled
- [ ] Error alerts configured
- [ ] Log retention understood

### Vercel
- [ ] Deployment notifications enabled
- [ ] Analytics enabled (optional)
- [ ] Error tracking configured (optional - Sentry)

### Database
- [ ] MongoDB Atlas monitoring enabled
- [ ] Backup schedule configured
- [ ] Alert thresholds set for storage/connections

---

## 🔐 Security Audit

### API Security
- [ ] All endpoints validate input
- [ ] Authentication required for protected routes
- [ ] Authorization checks for user-specific data
- [ ] Rate limiting prevents abuse
- [ ] CORS allows only production domains
- [ ] SQL injection prevented (using Mongoose)
- [ ] No sensitive data in logs

### Frontend Security
- [ ] No API keys in client-side code
- [ ] XSS protection enabled
- [ ] CSRF protection for state-changing operations
- [ ] Secure cookies for authentication
- [ ] Content Security Policy configured (optional)

### Infrastructure
- [ ] HTTPS enforced (automatic)
- [ ] Database access restricted by IP (optional)
- [ ] Environment variables not in git
- [ ] Secrets rotated regularly (plan)

---

## 📱 Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 🌍 SEO & Accessibility

### SEO
- [ ] Meta tags configured
- [ ] Open Graph tags for social sharing
- [ ] Sitemap generated (optional)
- [ ] robots.txt configured
- [ ] Page titles descriptive
- [ ] Alt text on images

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG standards
- [ ] Form labels properly associated
- [ ] ARIA labels where needed

---

## 📝 Documentation

- [ ] README.md updated
- [ ] API documentation available (optional)
- [ ] Deployment guide created ✓
- [ ] Environment variables documented
- [ ] Troubleshooting guide available
- [ ] Rollback procedure documented

---

## 🎯 Go-Live Checklist

### Final Checks
- [ ] All above sections completed
- [ ] Stakeholders notified of go-live date
- [ ] Support team briefed (if applicable)
- [ ] Monitoring dashboards ready
- [ ] Rollback plan tested
- [ ] Backup verified and tested

### Launch Day
- [ ] Deploy during low-traffic hours
- [ ] Monitor logs for errors
- [ ] Test critical user flows
- [ ] Monitor performance metrics
- [ ] Be ready to rollback if needed

### Post-Launch (First 24 Hours)
- [ ] Monitor error rates
- [ ] Check payment processing
- [ ] Verify email delivery (if applicable)
- [ ] Monitor database performance
- [ ] Check API response times
- [ ] Review user feedback

### Post-Launch (First Week)
- [ ] Analyze user behavior
- [ ] Identify performance bottlenecks
- [ ] Plan optimizations
- [ ] Update documentation based on issues
- [ ] Schedule regular backups
- [ ] Plan scaling strategy

---

## 🚨 Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Technical Lead | _______ | _______ |
| DevOps | _______ | _______ |
| Database Admin | _______ | _______ |
| Support Team | _______ | _______ |

---

## 📞 Support Resources

- **Render Status**: https://status.render.com
- **Vercel Status**: https://www.vercel-status.com
- **MongoDB Atlas Status**: https://status.cloud.mongodb.com
- **Paystack Status**: https://status.paystack.com
- **Flutterwave Status**: https://status.flutterwave.com

---

## 🎉 Congratulations!

Once all items are checked, you're ready for production!

**Remember:**
- Monitor closely for the first 48 hours
- Have rollback plan ready
- Keep stakeholders informed
- Celebrate the launch! 🚀

---

**Last Updated**: [Date]
**Reviewed By**: [Name]
**Next Review**: [Date]
