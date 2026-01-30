import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { ASSETS, AssetIconWrap, type TokenId } from "@/mocks/ghostAssets";

const BG = Colors.ghost;

export function AssetListItem(props: {
  token: TokenId;
  balance: number;
  price: number;
  totalPortfolioValue: number;
  hidden: boolean;
  testID?: string;
}) {
  const { token, balance, price, totalPortfolioValue, hidden, testID } = props;

  const asset = ASSETS[token];

  const usdValue = useMemo(() => balance * price, [balance, price]);
  const pct = useMemo(() => {
    if (totalPortfolioValue <= 0) return 0;
    return Math.min((usdValue / totalPortfolioValue) * 100, 100);
  }, [totalPortfolioValue, usdValue]);

  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: pct,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [barAnim, pct]);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 44],
  });

  return (
    <Pressable
      onPress={() => console.log("[asset] pressed", { token })}
      style={({ pressed }) => [styles.row, pressed ? { transform: [{ scale: 0.99 }] } : null]}
      testID={testID ?? `asset-${token}`}
    >
      <View style={styles.left}>
        <AssetIconWrap>
          <View style={{ opacity: 0.95 }}>{asset.icon}</View>
        </AssetIconWrap>

        <View style={{ gap: 3 }}>
          <Text style={styles.name}>{asset.name}</Text>
          <Text style={styles.meta}>
            {hidden ? "••••" : balance.toFixed(2)} {asset.ticker}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.usd}>{hidden ? "••••" : `$${usdValue.toFixed(2)}`}</Text>
        <View style={styles.pctRow}>
          {!hidden ? <Text style={styles.pct}>{pct.toFixed(2)}%</Text> : null}
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, { width: barWidth }]} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 22,
    backgroundColor: BG.card,
    borderWidth: 1,
    borderColor: BG.border,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  right: { alignItems: "flex-end" },
  name: { color: BG.text, fontWeight: "900", fontSize: 14, letterSpacing: -0.1 },
  meta: {
    color: BG.text2,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  usd: {
    color: BG.text,
    fontWeight: "900",
    fontSize: 13,
  },
  pctRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  pct: { color: BG.text2, fontSize: 10, fontWeight: "800" },
  barTrack: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  barFill: {
    height: 5,
    borderRadius: 999,
    backgroundColor: BG.accent,
  },
});
