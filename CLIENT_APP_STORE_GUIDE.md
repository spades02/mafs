# MAFS — App Store Connect Guide (for the client)

**Goal:** finish the App Store Connect side so MAFS passes Apple review and goes live.

Abdullah has already fixed everything inside the app's code (the crash, the billing screen,
Sign in with Apple, account deletion, the auth flow, and the Terms/Privacy pages). A **new app
version, Build 5**, will be uploaded for you. This guide covers the parts that can **only** be
done by you inside Apple's website — no coding involved.

> You'll do this on a computer at **https://appstoreconnect.apple.com** (sign in with the Apple
> ID that owns the MAFS app). A few steps use **https://developer.apple.com**. Take your time —
> nothing here can break the app.

---

## How the pieces fit (read this once)

Apple rejected the app for 8 reasons. They split into two groups:

- **Abdullah fixed in the app (already done):** the photo crash, the billing error, moving login
  inside the app, Sign in with Apple button, in-app "Delete Account", and Terms/Privacy pages.
- **You do in Apple's website (this guide):** turn on the subscriptions, fix the age rating, add
  the policy links, switch on "Sign in with Apple" for the app, and send Apple short videos.

Do the steps **in order**. Steps 1–2 are quick. Step 3 (Sign in with Apple) is the one to start
early because it has the most clicks.

---

## ✅ Quick checklist (tick as you go)

- [ ] 1. Age rating: set **Gambling = Yes**, turn **off** Parental Controls & Age Assurance
- [ ] 2. Add the **Privacy Policy** and **Terms of Use** links
- [ ] 3. Turn on **Sign in with Apple** and send Abdullah 4 values (he plugs them in)
- [ ] 4. Create & submit the **Pro** and **Elite** subscriptions (with a screenshot each)
- [ ] 5. Once Build 5 appears, **attach it**, then attach the subscriptions to the version
- [ ] 6. Record 3 short **videos** and paste notes for the reviewer
- [ ] 7. **Submit for review**

---

## Step 1 — Fix the Age Rating (5 minutes)

Apple flagged two things here: gambling must be "Yes", and two controls that aren't in the app
must be turned off.

1. Go to **App Store Connect → Apps → MAFS**.
2. In the left sidebar click **App Information** (under "General").
3. Scroll to **Age Rating** and click **Edit** (or **Set Up Age Rating**).
4. Find the question about **Gambling** (wording is like "Contests / gambling" or "Gambling").
   Set it to **Yes** (because the app has betting-related predictions and tools).
5. Find **Parental Controls** → set to **None**.
6. Find **Age Assurance** → set to **None**.
7. Click **Save / Done**.

✅ Done when: the age rating shows gambling enabled, and the two controls show "None".

---

## Step 2 — Add the Privacy Policy & Terms links (5 minutes)

Apple needs both links in your store listing.

1. **Privacy Policy URL:**
   - Left sidebar → **App Privacy** (or **App Information** → scroll to "Privacy Policy URL").
   - In the **Privacy Policy URL** box, paste: `https://mafs.ai/privacy`
   - Save.
2. **Terms of Use (EULA):**
   - Left sidebar → click your version (e.g. **"1.0 Prepare for Submission"**).
   - Scroll to the **Description** box and add this line at the bottom of the description text:
     `Terms of Use: https://mafs.ai/terms`
   - Save.

✅ Done when: Privacy Policy URL is filled, and the Terms link is in the description.

> Both pages are already live: open `https://mafs.ai/privacy` and `https://mafs.ai/terms` in a
> browser to confirm they load.

---

## Step 3 — Turn on "Sign in with Apple" (start this early)

This has two halves: **(A)** switch the feature on for the app, and **(B)** create a key and send
Abdullah 4 values so the login works on the server.

### Part A — Enable the capability (developer.apple.com)

1. Go to **https://developer.apple.com/account** → **Certificates, Identifiers & Profiles**.
2. Click **Identifiers** → find and click the app id **`ai.mafs.app`**.
3. In the list of capabilities, tick **Sign in with Apple** → **Save**.
   - If it asks to "Edit" / "Configure", just leave it as the default (primary App ID).
4. Apple may say the provisioning profile needs regenerating — if Abdullah set up automatic
   signing in AppFlow this is automatic; if not, tell Abdullah you enabled it so he can refresh
   the build profile.

### Part B — Create the values Abdullah needs

You'll collect **4 things**. Copy them into a note and send them to Abdullah.

1. **Team ID** (10 characters): top-right of the developer.apple.com page, under your name/org
   (looks like `6K2AZWR26Y`). → this is `APPLE_TEAM_ID`.
2. **Services ID:**
   - **Identifiers** → the **+** button → choose **Services IDs** → **Continue**.
   - Description: `MAFS Sign in with Apple`. Identifier: `ai.mafs.signin` → **Continue → Register**.
   - Open the new Services ID, tick **Sign in with Apple**, click **Configure**:
     - Primary App ID: choose **`ai.mafs.app`**.
     - Domains: `mafs.ai`
     - Return URLs: `https://mafs.ai/api/auth/callback/apple`
     - **Save**.
   - The identifier `ai.mafs.signin` → this is `APPLE_CLIENT_ID`.
3. **Sign in with Apple Key (.p8 file):**
   - Left menu → **Keys** → the **+** button.
   - Name: `MAFS Apple Sign In`. Tick **Sign in with Apple** → **Configure** → pick `ai.mafs.app`
     → **Save** → **Continue → Register**.
   - **Download** the `.p8` file (you can only download it once — keep it safe).
   - On that page note the **Key ID** (10 characters) → this is `APPLE_KEY_ID`.

### Send Abdullah these 4 items

```
APPLE_TEAM_ID         = (your 10-char Team ID)
APPLE_CLIENT_ID       = ai.mafs.signin
APPLE_KEY_ID          = (the 10-char Key ID)
APPLE_PRIVATE_KEY     = (the .p8 file you downloaded — send the file)
```

Abdullah plugs these into the server and the Apple login button starts working — **no new app
build is needed for this**, just his server update.

✅ Done when: "Sign in with Apple" is ticked on `ai.mafs.app`, and Abdullah has the 4 items.

---

## Step 4 — Create & submit the subscriptions (Pro & Elite)

Apple couldn't review because the **Pro** and **Elite** subscriptions were never submitted. This is
why the **Billing screen looked broken on the iPad** — once these are approved, that screen fills
in automatically.

> **Important:** the subscription **Product IDs** you create here must exactly match what's set up
> in **RevenueCat** (the service that powers in-app purchases). If you're not sure, send Abdullah
> the Product IDs you used so he can confirm they match the RevenueCat dashboard.

1. App Store Connect → **MAFS** → left sidebar **Subscriptions** (under "Monetization").
2. Create a **Subscription Group** (e.g. name it `MAFS Memberships`) if one doesn't exist.
3. Inside the group click **+** to create the first subscription:
   - **Reference Name:** `MAFS Pro`
   - **Product ID:** `mafs_pro_monthly` (or the exact ID used in RevenueCat — confirm with Abdullah)
   - **Duration:** 1 Month
   - **Price:** set the Pro price (e.g. the $39/month founding price)
   - **Localization / Display Name:** `MAFS Pro` + a short description
   - **App Review Screenshot:** upload any screenshot of the in-app subscription screen
     (Apple requires one image per subscription — a phone screenshot of the paywall is fine).
   - Save.
4. Click **+** again and repeat for **Elite**:
   - Reference Name `MAFS Elite`, Product ID `mafs_elite_monthly` (match RevenueCat), 1 Month,
     Elite price, display name, screenshot. Save.
5. Each subscription's status should move to **"Ready to Submit"**.

✅ Done when: both Pro and Elite show **Ready to Submit** with a price and a screenshot.

---

## Step 5 — Attach Build 5 and the subscriptions to the version

Do this after Abdullah tells you **Build 5** has finished processing (it appears under the version).

1. App Store Connect → **MAFS** → click the version (**"1.0 Prepare for Submission"**).
2. Scroll to the **Build** section → click **+** or **Select a build** → choose **Build 5**.
3. Scroll to **In-App Purchases / Subscriptions** on the same version page → make sure **Pro** and
   **Elite** are **selected/attached** to this version (tick them so they're submitted together).
4. Save.

✅ Done when: the version shows Build 5 and both subscriptions attached.

---

## Step 6 — Record 3 short videos + write reviewer notes

Apple specifically asked for screen recordings. Record these on a real iPhone/iPad (screen
recording: swipe down Control Center → tap the round Record button). Each can be 15–40 seconds.

1. **Account deletion:** sign in → go to **Settings** → scroll to **Delete Account** → tap
   **Delete My Account** → confirm → show it logs you out. (Proves Guideline 5.1.1(v).)
2. **Subscription screen with links:** open **Billing** → show the **Terms of Use** and
   **Privacy Policy** links at the bottom. (Proves Guideline 3.1.2(c).)
3. **Sign in (in-app):** show signing in with **Email/Password** and the **Sign in with Apple**
   button — no Safari/browser opens. (Proves Guidelines 4 and 4.8.)

Then add notes for the reviewer:

1. On the version page scroll to **App Review Information → Notes**.
2. Paste something like:

```
Demo account: demo@mafs.ai / (password)

Fixes in this build (1.0 build 5):
- Login/registration now happens fully in-app (Email/Password + Sign in with Apple). No external browser.
- Sign in with Apple added (Guideline 4.8).
- Account deletion: Settings > Delete Account (immediate, permanent). See attached recording.
- Profile photo "Take Photo" crash fixed (camera permission added).
- Billing screen no longer errors; subscriptions load via the App Store. Restore Purchases available.
- Subscription screen shows Terms of Use and Privacy Policy links.
- Age rating updated: Gambling = Yes; Parental Controls and Age Assurance = None.
- Pro and Elite in-app subscriptions submitted with this version.

Recordings attached for account deletion, the subscription screen links, and in-app sign-in.
```

3. Attach the 3 recordings here (or upload to a link and paste the link).
4. Provide the **demo account** login so the reviewer can sign in.

✅ Done when: notes are filled, demo login provided, recordings attached.

---

## Step 7 — Submit for review

1. Make sure Steps 1–6 are all green.
2. On the version page click **Add for Review** / **Submit for Review** (top right).
3. Answer any final compliance questions (encryption: usually "No" unless told otherwise).
4. Submit. 🎉

---

## If something looks off

- **Billing screen still says "Subscriptions Coming Soon" on the iPad:** that's expected until the
  Pro/Elite subscriptions are **approved** by Apple. It is no longer an error — it's a calm message
  with a **Restore Purchases** button, which is fine for review.
- **Sign in with Apple button does nothing / errors:** Abdullah hasn't received or finished adding
  the 4 values from Step 3 yet. Send them / confirm with him.
- **Can't find a setting:** Apple occasionally renames menus. Search the page for the keyword
  (Gambling, Privacy Policy, Subscriptions) — the labels above are the current ones.

Anything you're unsure about, screenshot it and send to Abdullah before clicking Submit.
