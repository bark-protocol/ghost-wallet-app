import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRightLeft, Sparkles, ShieldCheck, Zap } from "lucide-react-native";

import Colors from "@/constants/colors";
import { Header } from "@/components/ghost/Header";

const BG = Colors.ghost;

type Card = {
  id: string;
  title: string;
  subtitle: string;
  icon: "swap" | "bridge" | "boost";
  cta: string;
};

export default function DeFiScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  const cards = useMemo<Card[]>(
    () => [
      {
        id: "swap",
        title: "Swap",
        subtitle: "Route across pools",
        icon: "swap",
        cta: "BUILD ROUTE",
      },
      {
        id: "bridge",
        title: "Bridge",
        subtitle: "Move assets cross-chain",
        icon: "bridge",
        cta: "PREP BRIDGE",
      },
      {
        id: "boost",
        title: "Boost",
        subtitle: "Yield boosters & perks",
        icon: "boost",
        cta: "VIEW BOOSTS",
      },
    ],
    []
  );

  return (
    <View style={styles.screen} testID="defi-screen">
      <LinearGradient
        colors={["rgba(201,166,106,0.14)", "rgba(11,13,16,0.0)", "rgba(11,13,16,1)"]}
        locations={[0, 0.32, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Header title="DeFi" subtitle="Swap & Bridge" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <ArrowRightLeft size={18} color={BG.accent} />
          </View>
          <Text style={styles.heroTitle}>One-tap routes</Text>
          <Text style={styles.heroSub}>
            Preview swaps and bridges with a clean simulation layer. (Demo UI)
          </Text>
        </View>

        <View style={styles.grid}>
          {cards.map((c) => {
            const active = selected === c.id;
            const Icon = c.icon === "swap" ? ArrowRightLeft : c.icon === "bridge" ? ShieldCheck : Sparkles;
            return (
              <Pressable
                key={c.id}
                onPress={() => setSelected((v) => (v === c.id ? null : c.id))}
                style={({ pressed }) => [
                  styles.card,
                  active ? styles.cardActive : null,
                  pressed ? { transform: [{ scale: 0.99 }] } : null,
                ]}
                testID={`defi-card-${c.id}`}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardIcon}>
                    <Icon size={18} color={active ? BG.accent2 : BG.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{c.title}</Text>
                    <Text style={styles.cardSub}>{c.subtitle}</Text>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <View style={styles.pill}>
                    <Zap size={14} color={BG.accent} />
                    <Text style={styles.pillText}>Fast preview</Text>
                  </View>
                  <Text style={styles.cta}>{c.cta}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG.bg },
  content: { paddingHorizontal: 18, paddingBottom: 120 },
  hero: {
    marginTop: 12,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: BG.border,
    borderRadius: 22,
  },
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(201,166,106,0.10)",
    marginBottom: 10,
  },
  heroTitle: { color: BG.text, fontSize: 18, fontWeight: "900", letterSpacing: -0.2 },
  heroSub: { color: BG.text2, marginTop: 6, lineHeight: 18, fontSize: 13, fontWeight: "600" },
  grid: { gap: 12, marginTop: 14 },
  card: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: BG.card,
    borderWidth: 1,
    borderColor: BG.border,
  },
  cardActive: {
    backgroundColor: BG.accent,
    borderColor: "rgba(201,166,106,0.6)",
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 16,
    backgroundColor: "rgba(201,166,106,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { color: BG.text, fontSize: 16, fontWeight: "900" },
  cardSub: { color: BG.text2, fontSize: 12, fontWeight: "700", marginTop: 2 },
  cardBottom: { marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BG.border,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  pillText: { color: BG.text2, fontSize: 11, fontWeight: "800" },
  cta: { color: BG.text, fontWeight: "900", letterSpacing: 2.2, fontSize: 11 },
});
