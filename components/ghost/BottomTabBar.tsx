import React, { useMemo, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";
import { Camera, Clock, Home, Settings, ArrowRightLeft } from "lucide-react-native";
import { BlurView } from "expo-blur";

import Colors from "@/constants/colors";

const BG = Colors.ghost;

type Item = {
  key: string;
  label: string;
  icon:
    | "home"
    | "defi"
    | "history"
    | "settings";
};

type MinimalTabBarProps = {
  state: {
    index: number;
    routeNames: string[];
  };
  navigation: {
    navigate: (name: never) => void;
  };
};

export function BottomTabBar(props: MinimalTabBarProps) {
  const { state, navigation } = props;

  const items = useMemo<Item[]>(
    () => [
      { key: "home", label: "Home", icon: "home" },
      { key: "defi", label: "DeFi", icon: "defi" },
      { key: "history", label: "History", icon: "history" },
      { key: "settings", label: "Settings", icon: "settings" },
    ],
    []
  );

  const scale = useRef(new Animated.Value(1)).current;

  const onCenterPress = () => {
    console.log("[tabbar] center pressed");
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const activeRouteName = state.routeNames[state.index];

  return (
    <View style={styles.wrap} pointerEvents="box-none" testID="ghost-tabbar">
      {Platform.OS === "web" ? (
        <View style={styles.bar} testID="tabbar-bar">
        <View style={styles.sheen} />

        <View style={styles.row}>
          <View style={styles.side}>
            {items.slice(0, 2).map((it) => (
              <TabButton
                key={it.key}
                item={it}
                isActive={activeRouteName === it.key}
                onPress={() => navigation.navigate(it.key as never)}
              />
            ))}
          </View>

          <View style={styles.centerSlot}>
            <Animated.View style={{ transform: [{ scale }] }}>
              <Pressable
                onPress={onCenterPress}
                style={({ pressed }) => [styles.centerBtn, pressed ? { opacity: 0.92 } : null]}
                testID="tabbar-center"
              >
                <Camera size={20} color={BG.accent2} />
              </Pressable>
            </Animated.View>
            <View style={styles.centerShadow} />
          </View>

          <View style={styles.side}>
            {items.slice(2).map((it) => (
              <TabButton
                key={it.key}
                item={it}
                isActive={activeRouteName === it.key}
                onPress={() => navigation.navigate(it.key as never)}
              />
            ))}
          </View>
        </View>
        </View>
      ) : (
        <BlurView intensity={32} tint="dark" style={styles.bar} testID="tabbar-bar">
          <View style={styles.sheen} />

          <View style={styles.row}>
            <View style={styles.side}>
              {items.slice(0, 2).map((it) => (
                <TabButton
                  key={it.key}
                  item={it}
                  isActive={activeRouteName === it.key}
                  onPress={() => navigation.navigate(it.key as never)}
                />
              ))}
            </View>

            <View style={styles.centerSlot}>
              <Animated.View style={{ transform: [{ scale }] }}>
                <Pressable
                  onPress={onCenterPress}
                  style={({ pressed }) => [styles.centerBtn, pressed ? { opacity: 0.92 } : null]}
                  testID="tabbar-center"
                >
                  <Camera size={20} color={BG.accent2} />
                </Pressable>
              </Animated.View>
              <View style={styles.centerShadow} />
            </View>

            <View style={styles.side}>
              {items.slice(2).map((it) => (
                <TabButton
                  key={it.key}
                  item={it}
                  isActive={activeRouteName === it.key}
                  onPress={() => navigation.navigate(it.key as never)}
                />
              ))}
            </View>
          </View>
        </BlurView>
      )}
    </View>
  );
}

function TabButton(props: {
  item: Item;
  isActive: boolean;
  onPress: () => void;
}) {
  const { item, isActive, onPress } = props;
  const Icon =
    item.icon === "home"
      ? Home
      : item.icon === "defi"
        ? ArrowRightLeft
        : item.icon === "history"
          ? Clock
          : Settings;

  const color = isActive ? BG.accent : BG.text2;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tabBtn, pressed ? { transform: [{ scale: 0.98 }] } : null]}
      testID={`tab-${item.key}`}
    >
      <View style={styles.tabIconWrap}>
        <Icon size={18} color={color} strokeWidth={isActive ? 2.6 : 2.2} />
        {isActive ? <View style={styles.glow} /> : null}
      </View>
      <Animated.Text
        style={[
          styles.tabLabel,
          { color: isActive ? BG.text : BG.text2, opacity: isActive ? 1 : 0.85 },
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  bar: {
    height: 70,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: Platform.OS === "web" ? "rgba(17, 20, 26, 0.78)" : "transparent",
  },
  sheen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  side: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-around",
  },
  centerSlot: {
    width: 72,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: -16,
  },
  centerBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: BG.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: BG.bg,
    shadowColor: BG.accent,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  centerShadow: {
    position: "absolute",
    top: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.28)",
    opacity: Platform.OS === "web" ? 0.8 : 0,
  },
  tabBtn: {
    width: 74,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  tabIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(201,166,106,0.22)",
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
});
