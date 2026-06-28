---
name: Expo native tabs 5-item cap
description: Why >5 tabs disappear on real iOS devices with expo-router NativeTabs, and when to prefer ClassicTabLayout.
---

# Expo Router native tabs overflow

`expo-router/unstable-native-tabs` (`NativeTabs`) renders Apple's SwiftUI/UIKit
native tab bar. On iPhone that bar shows only ~5 items; any extra tabs are pushed
into an automatic **"More"** menu. With 7 tabs the later ones (e.g. Trips / News /
Settings) become hidden or hard to reach — a user just sees that some screens are
"missing" from the bottom bar.

**Why this is a trap:** Expo *web* and `@react-navigation/bottom-tabs`
(`ClassicTabLayout`) render ALL tabs with no overflow, so the bug is invisible in
the web preview and in automated web tap-through tests. It only reproduces on a
real iOS 26 device where `isLiquidGlassAvailable()` is true and the native branch
runs.

**How to apply:** If a tab layout needs more than ~5 tabs to stay permanently
visible, do not branch into `NativeTabs`. Use the classic React Navigation `Tabs`
layout on every platform (you lose iOS "Liquid Glass" tab styling but keep all
tabs reachable). If you must keep native tabs, cap visible tabs at 5 and move the
rest behind a hub/Settings.
