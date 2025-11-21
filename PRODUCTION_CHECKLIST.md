# Production Deployment Checklist

Use this checklist before deploying to production:

## ✅ Pre-Deployment

- [ ] **Environment Variables**
  - [ ] Create `.env` file with production values
  - [ ] Verify all API keys are set correctly
  - [ ] Never commit `.env` to version control

- [ ] **Build & Test**
  - [ ] Run `npm run build` successfully
  - [ ] Test production build with `npm run preview`
  - [ ] Verify all features work in production build
  - [ ] Check for console errors in browser

- [ ] **Code Quality**
  - [ ] Run `npm run lint` and fix all errors
  - [ ] Remove any test/debug code
  - [ ] Verify error handling is in place

- [ ] **Assets & Performance**
  - [ ] Optimize images (compress if needed)
  - [ ] Check bundle size (should be reasonable)
  - [ ] Verify lazy loading works (if implemented)

- [ ] **Security**
  - [ ] Review Content Security Policy in `index.html`
  - [ ] Ensure HTTPS is configured
  - [ ] Verify API endpoints use secure connections
  - [ ] Check for exposed API keys or secrets

- [ ] **SEO & Meta Tags**
  - [ ] Update meta tags in `index.html` with correct information
  - [ ] Verify Open Graph tags
  - [ ] Update `robots.txt` with correct domain
  - [ ] Add favicon if custom one exists

- [ ] **Testing**
  - [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
  - [ ] Test on mobile devices
  - [ ] Test responsive design at different screen sizes
  - [ ] Verify chat functionality works end-to-end
  - [ ] Test error scenarios (network failures, API errors)

## 🚀 Deployment Steps

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Verify build output**
   - Check `dist` folder exists
   - Verify all assets are present
   - Check file sizes are reasonable

3. **Deploy to hosting platform**
   - Follow platform-specific deployment instructions
   - See README.md for detailed deployment guides

4. **Post-Deployment Verification**
   - [ ] Visit production URL and verify site loads
   - [ ] Test core functionality (chat, model switching)
   - [ ] Check browser console for errors
   - [ ] Verify API calls are working
   - [ ] Test on mobile device
   - [ ] Check loading performance

## 📊 Monitoring

After deployment, monitor:
- [ ] Error rates (check browser console, server logs)
- [ ] Performance metrics (page load time, bundle size)
- [ ] User feedback
- [ ] API usage and costs

## 🔄 Rollback Plan

Have a rollback plan ready:
- [ ] Keep previous version accessible
- [ ] Document rollback procedure
- [ ] Test rollback process in staging

## 📝 Notes

- Production builds remove console.log statements automatically
- Source maps are disabled in production for security
- Error boundaries will catch React errors gracefully
- All environment variables must be set in production environment

---

**Last Updated:** 2025

