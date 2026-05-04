# Push Notifications — iOS Setup

**Status:** infra in place · **Date:** 2026-05-04 · **Scope:** Phase 6

## What this commit does (code)

- Adds `@capacitor/push-notifications` and `@parse/node-apn` to `package.json`.
- Adds `aps-environment` to `ios/App/App/App.entitlements` (development).
- Wires `didRegisterForRemoteNotificationsWithDeviceToken` and the failure callback in `AppDelegate.swift` so Capacitor's PushNotifications plugin can intercept them.
- Adds `device_tokens` table + `/api/push/register` endpoint.
- Adds `lib/push/apns.ts` server helper.
- Adds settings toggle that opts the user in/out and registers the device token.

## Manual Xcode steps required (one-time)

These cannot be safely automated from a script — they require Xcode UI:

1. Open `ios/App/App.xcworkspace` in Xcode.
2. **Targets → App → Signing & Capabilities → + Capability → Push Notifications.** This wires `App.entitlements` into the Xcode project (`project.pbxproj`).
3. **Targets → App → Signing & Capabilities → Background Modes → Remote notifications.** Optional but recommended for silent push.
4. Switch `aps-environment` in `App.entitlements` from `development` to `production` for App Store builds.

## Manual ops steps required (server)

Set the following env vars before the cron tries to send pushes:
- `APNS_KEY_ID` — 10-char Key ID from App Store Connect → Keys
- `APNS_TEAM_ID` — Apple Developer Team ID
- `APNS_BUNDLE_ID` — `ai.mafs.app` (must match `capacitor.config.ts.appId`)
- `APNS_KEY_P8` — the contents of the `AuthKey_<KeyID>.p8` file; put the full BEGIN/END PRIVATE KEY block in the env value
- `APNS_PRODUCTION` — `"true"` for prod APNs, `"false"` for sandbox (default)

## Decision: APNs only in v1, web push deferred

Web push (service worker + VAPID) requires a `public/sw.js`, VAPID key generation, browser permission flow, and `web-push` lib. iOS app users are the active push audience right now; web users have email retention. Add web push when web traffic justifies it.

## Trigger model

For v1, a single trigger: when the Phase 3 weekly card is generated, the cron sends "This week's MAFS picks are ready" to all users with valid device tokens AND `pushNotificationsOptIn = true`. No transactional pushes (login alert, settle alert, etc.) until we measure baseline opt-in.
