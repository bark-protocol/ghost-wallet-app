import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowDownLeft, ArrowUpRight, Clock3 } from "lucide-react-native";

import Colors from "@/constants/colors";
import { Header } from "@/components/ghost/Header";

const BG = Colors.ghost;

type Tx = {
  id: string;
  type: "send" | "receive";
  token: string;
  amount: number;
  usd: number;
  time: string;
  status: "finalized" | "pending";
};

export default function HistoryScreen() {
  const txs = useMemo<Tx[]>(
    () => [
      { id: "1", type: "receive", token: "USDC", amount: 125, usd: 125, time: "Today · 11:42", status: "finalized" },
      { id: "2", type: "send", token: "SOL", amount: 0.8, usd: 78.6, time: "Yesterday · 19:10", status: "finalized" },
      { id: "3", type: "send", token: "GHOST", amount: 350, usd: 63, time: "Yesterday · 14:23", status: "pending" },
      { id: "4", type: "receive", token: "ETH", amount: 0.03, usd: 69.95, time: "Jan 18 · 09:02", status: "finalized" },
    ],
    []
  );

  return (
    <View style={styles.screen} testID="history-screen">
      <LinearGradient
        colors={["rgba(201,166,106,0.10)", "rgba(11,13,16,0.0)", "rgba(11,13,16,1)"]}
        locations={[0, 0.36, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Header title="History" subtitle="Recent activity" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <Clock3 size={18} color={BG.accent} />
          </View>
          <Text style={styles.summaryTitle}>Activity feed</Text>
          <Text style={styles.summarySub}>A clean timeline with pending state.</Text>
        </View>

        <View style={{ marginTop: 14, gap: 10 }}>
          {txs.map((tx) => (
            <View key={tx.id} style={styles.row} testID={`tx-${tx.id}`}>
              <View style={[styles.rowIcon, tx.type === "receive" ? styles.receiveIcon : styles.sendIcon]}>
                {tx.type === "receive" ? (
                  <ArrowDownLeft size={18} color={tx.type === "receive" ? BG.success : BG.text} />
                ) : (
                  <ArrowUpRight size={18} color={BG.danger} />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  {tx.type === "receive" ? "Received" : "Sent"} {tx.token}
                </Text>
                <Text style={styles.rowSub}>{tx.time}</Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.rowAmount}>{tx.type === "receive" ? "+" : "-"}{tx.amount}</Text>
                <Text style={styles.rowUsd}>${tx.usd.toFixed(2)}</Text>
                <Text style={[styles.badge, tx.status === "pending" ? styles.badgePending : styles.badgeFinal]}>
                  {tx.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG.bg },
  content: { paddingHorizontal: 18, paddingBottom: 120 },
  summary: {
    marginTop: 12,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: BG.border,
    borderRadius: 22,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(201,166,106,0.10)",
    marginBottom: 10,
  },
  summaryTitle: { color: BG.text, fontSize: 18, fontWeight: "900" },
  summarySub: { color: BG.text2, marginTop: 6, fontSize: 13, fontWeight: "600" },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 14,
    borderRadius: 20,
    backgroundColor: BG.card,
    borderWidth: 1,
    borderColor: BG.border,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BG.border,
  },
  receiveIcon: { backgroundColor: "rgba(50,213,131,0.06)" },
  sendIcon: { backgroundColor: "rgba(255,77,77,0.06)" },
  rowTitle: { color: BG.text, fontWeight: "900", fontSize: 14 },
  rowSub: { color: BG.text2, fontWeight: "600", fontSize: 12, marginTop: 2 },
  rowAmount: { color: BG.text, fontWeight: "900", fontSize: 14 },
  rowUsd: { color: BG.text2, fontWeight: "700", fontSize: 12, marginTop: 2 },
  badge: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  badgePending: { color: BG.accent },
  badgeFinal: { color: BG.success },
});
