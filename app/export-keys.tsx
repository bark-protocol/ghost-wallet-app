import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import * as ScreenCapture from "expo-screen-capture";
import { Eye, EyeOff, KeyRound, ShieldAlert, ShieldCheck, X } from "lucide-react-native";
import { router } from "expo-router";

import Colors from "@/constants/colors";

const BG = Colors.ghost;

const DEMO_MNEMONIC_WORDS: string[] = [
  "drift",
  "ghost",
  "silent",
  "ember",
  "vault",
  "orbit",
  "ivory",
  "signal",
  "paper",
  "lumen",
  "north",
  "thread",
];

type AuthState = "idle" | "authorizing" | "authorized" | "error";

export default function ExportKeysScreen() {
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  useEffect(() => {
    console.log("[export-keys] screen capture protection mount");

    if ((Platform.OS as string) === "web") {
      return;
    }

    (async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync();
        console.log("[export-keys] preventScreenCaptureAsync enabled");
      } catch (e) {
        console.log("[export-keys] preventScreenCaptureAsync error", e);
      }
    })().catch((e) => console.log("[export-keys] preventScreenCaptureAsync outer error", e));

    return () => {
      (async () => {
        try {
          await ScreenCapture.allowScreenCaptureAsync();
          console.log("[export-keys] allowScreenCaptureAsync restored");
        } catch (e) {
          console.log("[export-keys] allowScreenCaptureAsync error", e);
        }
      })().catch((e) => console.log("[export-keys] allowScreenCaptureAsync outer error", e));
    };
  }, []);

  const subtitle = useMemo(() => {
    if (authState === "authorizing") return "Authorizing…";
    if (authState === "authorized") return "Keep this phrase offline. Never share it.";
    if (authState === "error") return "Authorization failed. Try again.";
    return "Sensitive. Requires device authentication.";
  }, [authState]);

  const mnemonicMasked = useMemo(() => {
    return DEMO_MNEMONIC_WORDS.map(() => "••••••");
  }, []);

  const mnemonicToShow = authState === "authorized" && isRevealed ? DEMO_MNEMONIC_WORDS : mnemonicMasked;

  const authorize = useCallback(async () => {
    console.log("[export-keys] authorize pressed", { platform: Platform.OS });

    if ((Platform.OS as string) === "web") {
      Alert.alert("Not supported on web", "Key export is disabled on web. Use a device build.");
      return;
    }

    setAuthState("authorizing");

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      console.log("[export-keys] precheck", { hasHardware, isEnrolled });

      if (!hasHardware || !isEnrolled) {
        setAuthState("error");
        Alert.alert("Biometrics unavailable", "Set up Face ID / Touch ID (or device biometrics) and try again.");
        return;
      }

      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: "Reveal recovery phrase",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      console.log("[export-keys] auth result", res);

      if (!res.success) {
        setAuthState("error");
        return;
      }

      setAuthState("authorized");
      setIsRevealed(true);
    } catch (e) {
      console.log("[export-keys] authorize error", e);
      setAuthState("error");
      Alert.alert("Authorization error", "Couldn't authenticate. Please try again.");
    }
  }, []);

  const onCopy = useCallback(() => {
    const phrase = DEMO_MNEMONIC_WORDS.join(" ");

    if (authState !== "authorized" || !isRevealed) {
      Alert.alert("Locked", "Authenticate to reveal the phrase first.");
      return;
    }

    if ((Platform.OS as string) === "web") {
      Alert.alert("Unavailable", "Copy is disabled on web for key material.");
      return;
    }

    Alert.alert("Copy disabled", "For safety, copying the recovery phrase is disabled in this demo.");

    console.log("[export-keys] copy attempted", { len: phrase.length });
  }, [authState, isRevealed]);

  return (
    <View style={styles.screen} testID="export-keys-screen">
      <LinearGradient
        colors={["rgba(255,77,77,0.14)", "rgba(11,13,16,0.0)", "rgba(11,13,16,1)"]}
        locations={[0, 0.46, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.closeBtn, pressed ? { transform: [{ scale: 0.98 }], opacity: 0.9 } : null]}
          testID="export-keys-close"
          hitSlop={10}
        >
          <X size={18} color={BG.text2} />
        </Pressable>
      </View>

      <View style={styles.header}>
        <View style={styles.badge}>
          <KeyRound size={18} color={BG.accent} />
        </View>
        <Text style={styles.title}>Recovery Phrase</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {authState === "authorized" ? (
              <ShieldCheck size={18} color={BG.success} />
            ) : (
              <ShieldAlert size={18} color={"rgba(255,77,77,0.9)"} />
            )}
            <Text style={styles.cardTitle}>{authState === "authorized" ? "AUTHORIZED" : "LOCKED"}</Text>
          </View>

          <Pressable
            onPress={() => {
              if (authState !== "authorized") return;
              setIsRevealed((v) => !v);
            }}
            disabled={authState !== "authorized"}
            style={({ pressed }) => [
              styles.iconBtn,
              authState !== "authorized" ? { opacity: 0.5 } : null,
              pressed && authState === "authorized" ? { transform: [{ scale: 0.98 }], opacity: 0.9 } : null,
            ]}
            testID="export-keys-toggle-reveal"
          >
            {isRevealed ? <EyeOff size={18} color={BG.text2} /> : <Eye size={18} color={BG.text2} />}
          </Pressable>
        </View>

        <View style={styles.grid} testID="export-keys-words">
          {mnemonicToShow.map((w, idx) => (
            <View key={`${idx}-${w}`} style={styles.wordPill}>
              <Text style={styles.wordIndex}>{idx + 1}</Text>
              <Text style={styles.wordText} numberOfLines={1}>
                {w}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.cardActions}>
          {authState === "authorized" ? (
            <Pressable
              onPress={onCopy}
              style={({ pressed }) => [styles.secondaryBtn, pressed ? { transform: [{ scale: 0.99 }], opacity: 0.9 } : null]}
              testID="export-keys-copy"
            >
              <Text style={styles.secondaryBtnText}>COPY (DISABLED)</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={authorize}
              style={({ pressed }) => [styles.primaryBtn, pressed ? { transform: [{ scale: 0.99 }], opacity: 0.9 } : null]}
              testID="export-keys-authorize"
            >
              <Text style={styles.primaryBtnText}>AUTHORIZE</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => {
              console.log("[export-keys] close pressed");
              router.back();
            }}
            style={({ pressed }) => [styles.ghostBtn, pressed ? { transform: [{ scale: 0.99 }], opacity: 0.9 } : null]}
            testID="export-keys-done"
          >
            <Text style={styles.ghostBtnText}>DONE</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.warning} testID="export-keys-warning">
        <Text style={styles.warningTitle}>DO NOT</Text>
        <Text style={styles.warningText}>Screenshot, share, or store this phrase in cloud notes.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG.bg },
  topBar: { paddingHorizontal: 18, paddingTop: 18, alignItems: "flex-end" },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: BG.border,
    alignItems: "center",
    justifyContent: "center",
  },
  header: { alignItems: "center", paddingHorizontal: 18, paddingTop: 18 },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: "rgba(201,166,106,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,166,106,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { color: BG.text, fontSize: 22, fontWeight: "900", letterSpacing: -0.3 },
  subtitle: { color: BG.text2, fontSize: 12, fontWeight: "700", marginTop: 6, textAlign: "center" },
  card: {
    marginTop: 16,
    marginHorizontal: 18,
    borderRadius: 24,
    backgroundColor: BG.card,
    borderWidth: 1,
    borderColor: BG.border,
    padding: 14,
  },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { color: BG.text2, fontWeight: "900", fontSize: 10, letterSpacing: 3 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: BG.border,
  },
  grid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  wordPill: {
    width: "47%",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  wordIndex: { width: 18, color: BG.text3, fontSize: 11, fontWeight: "900" },
  wordText: { flex: 1, color: BG.text, fontSize: 13, fontWeight: "900", letterSpacing: 0.2 },
  cardActions: { marginTop: 14, gap: 10 },
  primaryBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: BG.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: BG.accent2, fontSize: 11, fontWeight: "900", letterSpacing: 2.4 },
  secondaryBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: BG.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { color: BG.text2, fontSize: 11, fontWeight: "900", letterSpacing: 2.4 },
  ghostBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  ghostBtnText: { color: BG.text2, fontSize: 11, fontWeight: "900", letterSpacing: 2.4 },
  warning: {
    marginTop: 16,
    marginHorizontal: 18,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,77,77,0.22)",
    backgroundColor: "rgba(255,77,77,0.06)",
  },
  warningTitle: { color: "rgba(255,77,77,0.92)", fontWeight: "900", fontSize: 10, letterSpacing: 3 },
  warningText: { marginTop: 6, color: "rgba(233, 238, 245, 0.75)", fontWeight: "700", fontSize: 12 },
});
