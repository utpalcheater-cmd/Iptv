---
name: Expo web font fallback
description: Expo mobile previews can remain blank when remote font hydration never resolves in the web renderer.
---

Keep native Expo screens gated on bundled font loading, but allow the web renderer to use system fallbacks when font loading is still pending. This preserves Android typography while keeping the browser preview visible.

**Why:** The Expo web preview can mount the app without surfacing a font-loading error, so a strict `fontsLoaded` gate produces a blank page even though Metro and the API are healthy.

**How to apply:** In the root Expo layout, gate only non-web platforms on `fontsLoaded`; let web render when `fontError` has not appeared yet.