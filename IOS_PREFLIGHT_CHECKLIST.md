# MAFS iOS Pre-Flight Checklist

**Version:** 1.0  
**Date:** January 23, 2026  
**Status:** Ready for QA Verification

---

## 📋 Executive Summary

This checklist must be completed before building and submitting the MAFS iOS app to TestFlight/App Store. All items marked with ❌ must be resolved before proceeding.

---

## 🔧 Technical Prerequisites

### Build Environment
- [ ] macOS with latest Xcode installed
- [ ] Apple Developer Account with active membership
- [ ] Node.js v18+ installed
- [ ] App ID `com.mafs.app` registered in Apple Developer Portal

### Codebase Verification
| Check | Status | Command to Verify |
|-------|--------|-------------------|
| Next.js Build | ✅ Passing | `npm run build` |
| TypeScript | ✅ No errors | `npx tsc --noEmit` |
| ESLint | ⚠️ Warnings exist | `npm run lint` |
| Mobile Navigation | ✅ Fixed | Visual check on mobile |

---

## 📱 Functional Testing Checklist

### Authentication Flow
- [ ] Google Sign-In works in WebView
- [ ] Session persists after app restart
- [ ] Logout redirects to home page
- [ ] Protected routes redirect unauthenticated users

### Core Features
- [ ] Event dropdown loads with future UFC events
- [ ] "Refresh Events" option fetches new events from API
- [ ] "Run Full Card Analysis" button triggers AI analysis
- [ ] Analysis progress bar displays correctly
- [ ] Best Bets cards render with EV percentages
- [ ] Fight Table is scrollable horizontally on mobile
- [ ] Fight Breakdown expands when clicking a fight
- [ ] "Why MAFS Likes This Bet" accordion opens correctly

### Billing & Payments
- [ ] Free user sees usage counter (X/3 analyses)
- [ ] "Upgrade to Pro" button redirects to Stripe
- [ ] Stripe checkout completes successfully
- [ ] Success redirect returns user to app
- [ ] Pro user sees unlimited access badge
- [ ] "Manage Subscription" opens Stripe Customer Portal

### Navigation (Critical - Recently Fixed)
- [ ] Mobile hamburger menu appears on screens < 768px
- [ ] Mobile menu opens when tapped
- [ ] All navigation items are visible in mobile menu
- [ ] Links navigate correctly and close the menu
- [ ] Desktop navigation still works (hidden hamburger)

---

## 📐 Responsiveness Testing

### Test Devices/Viewports
| Device | Width | Priority | Tested |
|--------|-------|----------|--------|
| iPhone SE | 320px | High | [ ] |
| iPhone 13/14 | 390px | High | [ ] |
| iPhone 15 Pro Max | 430px | High | [ ] |
| iPad Mini | 768px | Medium | [ ] |
| iPad Pro 12.9" | 1024px | Medium | [ ] |

### UI Elements to Verify
- [ ] Navbar logo and text don't overflow
- [ ] Event select dropdown is fully visible
- [ ] Analysis button is tappable (min 44px touch target)
- [ ] Cards don't overlap or cut off
- [ ] Tables scroll horizontally without clipping
- [ ] Modals/dialogs are centered and visible
- [ ] Keyboard doesn't cover input fields
- [ ] Safe areas respected (notch, home indicator)

---

## 🍎 iOS-Specific Checks

### Capacitor Configuration
- [ ] `capacitor.config.ts` has correct production URL
- [ ] Server URL is `https://mafs-indol.vercel.app`
- [ ] StatusBar plugin configured for dark style
- [ ] Haptics plugin imported and working (device only)

### Native Assets
- [ ] App Icon (1024x1024) added to Assets.xcassets
- [ ] All icon sizes generated (use appicon.co)
- [ ] LaunchScreen.storyboard configured with logo
- [ ] Splash screen background matches app theme (#0f1419)

### Info.plist Verification
- [ ] Bundle Display Name: "MAFS"
- [ ] Bundle Identifier: "com.mafs.app"
- [ ] Supported orientations include Portrait
- [ ] Camera/Photo permissions not needed (remove if present)

---

## 🔒 Security Checklist

- [ ] API keys not exposed in client-side code
- [ ] Environment variables properly configured on Vercel
- [ ] HTTPS enforced (no cleartext HTTP in production)
- [ ] Authentication tokens handled securely
- [ ] Stripe webhook signature validation enabled

---

## 🚀 Deployment Verification

### Vercel Production
- [ ] Latest changes deployed to `https://mafs-indol.vercel.app`
- [ ] No console errors in production
- [ ] API routes responding correctly
- [ ] Database connections stable

### Before Xcode Build
1. [ ] Run `npm install`
2. [ ] Run `npm run build` (verify passes)
3. [ ] Run `npx cap sync ios`
4. [ ] Open `npx cap open ios`

### In Xcode
1. [ ] Select "Any iOS Device" or physical device
2. [ ] Set Team in Signing & Capabilities
3. [ ] Verify Bundle ID is `com.mafs.app`
4. [ ] Product → Archive (not Build)
5. [ ] Upload to App Store Connect

---

## 📊 Known Issues & Workarounds

### Issue 1: Haptics Not Working in Simulator
**Status:** Expected behavior  
**Workaround:** Test haptics on physical device only

### Issue 2: ESLint Warnings
**Status:** Non-blocking  
**Details:** 42 warnings related to unused variables and `any` types  
**Action:** Can be addressed post-launch

### Issue 3: Tables Hard to Read on Small Screens
**Status:** Mitigated  
**Details:** Horizontal scroll enabled, consider card layout for v2

---

## ✅ Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Developer | | | |
| QA Lead | | | |
| PM | | | |

---

## 📝 Notes

- **TestFlight Processing:** Expect 5-30 minutes after upload
- **External Testers:** Require Apple review (1-2 days)
- **Internal Testers:** Available immediately after processing
- **Minimum iOS Version:** 13.0

---

*Last updated: January 23, 2026*
