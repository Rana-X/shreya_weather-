---
name: Expo/Metro stale bundle after deleting modules
description: Why typecheck can pass while the Expo app crashes at runtime, and the fix
---

After deleting a React Native hook/module (e.g. a removed feature's `useX`
hook) and removing its references, `pnpm run typecheck` can be fully green
while the running Expo app still crashes with `ReferenceError: Property 'useX'
doesn't exist`.

**Why:** Metro keeps serving a previously-built bundle (with stale source maps
pointing at old line numbers) until its workflow is restarted. The typecheck
runs against current source; the device/preview runs the old bundle.

**How to apply:** After deleting or renaming RN modules/hooks, restart the
Expo/Metro workflow and re-check its logs before trusting that the change
landed. Do not rely on typecheck alone to confirm a runtime fix in Expo.
