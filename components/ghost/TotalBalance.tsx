import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import type { TokenId } from "@/mocks/ghostAssets";

const BG = Colors.ghost;

export function TotalBalance(props: {
  balances: Record<TokenId, number>;
  prices: Record<TokenId, number>;
  hidden: boolean;
  testID?: string;
}) {
  const { balances, prices, hidden, testID } = props;

  const total = useMemo(() => {
    const keys = Object.keys(balances) as TokenId[];
    return keys.reduce((acc, token) => acc + (balances[token] ?? 0) * (prices[token] ?? 0), 0);
  }, [balances, prices]);

  return (
    <View style={styles.card} testID={testID}>
      <LinearGradient
        colors={["rgba(201,166,106,0.22)", "rgba(255,255,255,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Text style={styles.kicker}>TOTAL BALANCE</Text>
      <Text style={styles.amount}>{hidden ? "••••" : `$${total.toFixed(2)}`}</Text>
      <Text style={styles.sub}>{hidden ? "Tap Show to reveal" : "Across tracked assets"}</Text>

      <View style={styles.chips}>
        <Chip label="SECURE" />
        <Chip label="INSTANT" />
        <Chip label="DEMO" />
      </View>
    </View>
  );
}

function Chip(props: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{props.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    overflow: "hidden",
    padding: 18,
    backgroundColor: BG.card,
    borderWidth: 1,
    borderColor: BG.border,
  },
  kicker: {
    color: BG.text2,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 3,
  },
  amount: {
    marginTop: 10,
    color: BG.text,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  sub: {
    marginTop: 6,
    color: BG.text2,
    fontSize: 13,
    fontWeight: "600",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipText: {
    color: BG.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.2,
  },
});
