# MAFS iOS Build Guide (For Mac Users)

This guide walks you through building and deploying the MAFS iOS app using a Mac.

---

## Prerequisites

- **macOS** (latest recommended)
- **Xcode** installed from the Mac App Store
- **Apple Developer Account** (required for TestFlight/App Store)
- **Node.js** (v18+) and npm

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/spades02/mafs
cd mafs
```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Sync Capacitor iOS Project

This ensures the iOS native project is up-to-date with the latest web code and plugins:

```bash
npx cap sync ios
```

---

## Step 4: Open in Xcode

```bash
npx cap open ios
```

This will open the `ios/App/App.xcworkspace` file in Xcode.

---

## Step 5: Configure Signing & Capabilities

1. In Xcode, select the **App** target in the left sidebar
2. Go to the **Signing & Capabilities** tab
3. Check **"Automatically manage signing"**
4. Select your **Team** (your Apple Developer account)
5. Ensure **Bundle Identifier** is: `com.mafs.app`

> ⚠️ If you get a signing error, you may need to create an App ID in your [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list).

---

## Step 6: Add App Icons

### Generate Icons
1. Use your 1024x1024 PNG logo (no transparency, no alpha channel)
2. Go to [AppIcon.co](https://appicon.co) or [MakeAppIcon](https://makeappicon.com/)
3. Upload your logo and download the iOS icon set

### Add to Xcode
1. In Xcode, open **App → Assets.xcassets → AppIcon**
2. Drag all the generated icon sizes into the appropriate slots
3. Or: Delete the existing `AppIcon.appiconset` folder and drag in the downloaded one

---

## Step 7: Configure Splash Screen

### Option A: LaunchScreen Storyboard (Recommended)
1. In Xcode, open **App → App → LaunchScreen.storyboard**
2. Add your logo as an ImageView centered on the screen
3. Set the background color to match your app (`#000000` for black)

### Option B: Static LaunchImage
1. In **Assets.xcassets**, create a new **Image Set** called `LaunchImage`
2. Add your splash screen images for different device sizes

---

## Step 8: Test on Simulator or Device

### Simulator
1. In Xcode, select a simulator from the device dropdown (e.g., "iPhone 15 Pro")
2. Click the **Play ▶️** button
3. Wait for the build and the app will launch in the simulator

### Physical Device
1. Connect your iPhone via USB
2. Trust the computer on your iPhone if prompted
3. Select your device from the dropdown
4. Click **Play ▶️**

> 📱 First-time device users: Go to **Settings → General → VPN & Device Management** on the iPhone and trust your developer certificate.

---

## Step 9: Archive for TestFlight

Once you're happy with testing:

1. In Xcode: **Product → Archive** (make sure a real device or "Any iOS Device" is selected, NOT a simulator)
2. Wait for the archive to complete
3. The **Organizer** window will open automatically
4. Select your archive and click **Distribute App**
5. Choose **App Store Connect** → **Upload**
6. Follow the prompts (select your team, accept defaults)
7. Wait for upload to complete

---

## Step 10: TestFlight Distribution

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app (or create it if first time)
3. Go to **TestFlight** tab
4. Your uploaded build will appear after processing (5-30 mins)
5. Add **Internal Testers** or create an **External Testing** group
6. Testers will receive an email/notification to install via TestFlight app

---

## Troubleshooting

### "No signing certificate" error
- Ensure you have a valid Apple Developer membership
- In Xcode: **Xcode → Settings → Accounts** → Add your Apple ID → Download certificates

### App shows blank white screen
- Ensure `capacitor.config.ts` has the correct server URL
- Check that `https://mafs-indol.vercel.app` is accessible

### Haptics not working in simulator
- Haptic feedback only works on physical devices, this is expected

---

## Quick Reference: Key Files

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Capacitor configuration (app ID, server URL) |
| `ios/App/App/Info.plist` | iOS app metadata |
| `ios/App/App/Assets.xcassets` | App icons and images |
| `ios/App/App/LaunchScreen.storyboard` | Splash screen layout |

---

## App Configuration Summary

| Setting | Value |
|---------|-------|
| **App Name** | MAFS |
| **Bundle ID** | com.mafs.app |
| **Server URL** | https://mafs-indol.vercel.app |
| **Min iOS Version** | 13.0 |

---

## Need Help?

- [Capacitor iOS Docs](https://capacitorjs.com/docs/ios)
- [Apple Developer Docs](https://developer.apple.com/documentation/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

---

*Last updated: January 2026*
