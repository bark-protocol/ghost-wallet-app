import React from "react";
import { Tabs } from "expo-router";

import { BottomTabBar } from "@/components/ghost/BottomTabBar";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="defi" options={{ title: "DeFi" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
