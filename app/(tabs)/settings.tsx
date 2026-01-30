import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { EyeOff, KeyRound, ShieldCheck } from "lucide-react-native";
import { router } from "expo-router";

import Colors from "@/constants/colors";
import { Header } from "@/components/ghost/Header";
import { useWallet } from "@/context/wallet";

const BG = Colors.ghost;

export default function SettingsScreen() {
  const { isBiometricEnabled, setBiometricsEnabled, lock, hasPin } = useWallet();

  const [hideBalances, setHideBalances] = useState<boolean>(false);

  return (
    <View style={styles.screen} testID="settings-screen">
      <LinearGradient
        colors={["rgba(201,166,106,0.08)", "rgba(11,13,16,0.0)", "rgba(11,13,16,1)"]}
        locations={[0, 0.34, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Settings" subtitle="App preferences" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.group}>
          <Text style={styles.groupTitle}>SECURITY</Text>

          <Row
            icon={<EyeOff size={18} color={BG.accent} />}
            title="Hide balances"
            subtitle="Mask holdings across the app"
            right={<Switch value={hideBalances} onValueChange={setHideBalances} />}
            testID="setting-hide-balances"
          />

          <Row
            icon={<ShieldCheck size={18} color={BG.accent} />}
            title="Biometrics"
            subtitle="Unlock with Face ID / fingerprint"
            right={<Switch value={isBiometricEnabled} onValueChange={setBiometricsEnabled} />}
            testID="setting-biometrics"
          />

          <Row
            icon={<KeyRound size={18} color={BG.accent} />}
            title="Lock wallet"
            subtitle={hasPin ? "Require PIN to continue" : "Set a PIN first"}
            right={<Text style={styles.rightHint}>LOCK</Text>}
            onPress={() => {
              console.log("[settings] lock wallet pressed");
              if (!hasPin) {
                router.push("/lock");
                return;
              }
              lock("user_requested");
              router.push("/lock");
            }}
            testID="setting-lock"
          />

          <Row
            icon={<KeyRound size={18} color={BG.accent} />}
            title="Set PIN"
            subtitle={hasPin ? "PIN is set" : "Initialize a 6-digit PIN"}
            right={<Text style={styles.rightHint}>SET</Text>}
            onPress={() => {
              console.log("[settings] set pin pressed");
              router.push("/lock");
            }}
            testID="setting-set-pin"
          />

          <Row
            icon={<KeyRound size={18} color={BG.accent} />}
            title="Export keys"
            subtitle="View your recovery phrase"
            right={<Text style={styles.rightHint}>VIEW</Text>}
            onPress={() => console.log("[settings] export keys pressed")}
            testID="setting-export"
          />
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Ghost Wallet · Demo</Text>
          <Text style={styles.footerSub}>No on-chain actions. UI prototype for mobile.</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function Row(props: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  right: React.ReactNode;
  onPress?: () => void;
  testID?: string;
}) {
  const { icon, title, subtitle, right, onPress, testID } = props;

  const content = (
    <View style={styles.row} testID={testID}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>{right}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed ? { transform: [{ scale: 0.995 }] } : null]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG.bg },
  content: { paddingHorizontal: 18, paddingBottom: 120 },
  group: {
    marginTop: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: BG.card,
    borderWidth: 1,
    borderColor: BG.border,
  },
  groupTitle: { color: BG.text2, fontSize: 10, fontWeight: "900", letterSpacing: 3, marginBottom: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 16,
    backgroundColor: "rgba(201,166,106,0.10)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BG.border,
  },
  rowTitle: { color: BG.text, fontWeight: "900", fontSize: 14 },
  rowSub: { color: BG.text2, fontWeight: "600", fontSize: 12, marginTop: 2 },
  rightHint: { color: BG.accent, fontWeight: "900", fontSize: 12, letterSpacing: 2 },
  footerCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: BG.border,
  },
  footerTitle: { color: BG.text, fontWeight: "900", fontSize: 14 },
  footerSub: { color: BG.text2, fontWeight: "600", fontSize: 12, marginTop: 4 },
});
