import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { Fingerprint, Ghost, X } from "lucide-react-native";
import { router } from "expo-router";

import Colors from "@/constants/colors";
import { useWallet } from "@/context/wallet";
import { PinInput } from "@/components/ghost/PinInput";

const BG = Colors.ghost;

export default function LockScreen() {
  const { checkPin, unlock, isBiometricEnabled, walletLogEvent, isReady, hasPin, lockUntilMs } = useWallet();

  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const PIN_LENGTH = 6;

  const isLockedOut = Boolean(lockUntilMs && lockUntilMs > Date.now());

  const subtitle = useMemo(() => {
    if (!isReady) return "Initializing secure vault...";
    if (!hasPin) return "Set a PIN in Settings to enable lock.";

    if (lockUntilMs && lockUntilMs > Date.now()) {
      const seconds = Math.ceil((lockUntilMs - Date.now()) / 1000);
      return `Too many attempts. Try again in ${seconds}s.`;
    }

    if (error) return "Incorrect PIN. Try again.";
    return "Unlock your wallet to continue.";
  }, [error, hasPin, isReady, lockUntilMs]);

  useEffect(() => {
    if (!isReady) return;
    if (!hasPin) return;

    if (pin.length === PIN_LENGTH) {
      (async () => {
        const res = await checkPin(pin);

        if (res.ok) {
          walletLogEvent("PIN_ATTEMPT", (Platform.OS as string) === "web" ? "WEB" : "MOBILE", "Wallet unlocked successfully with PIN", {
            success: true,
            method: "pin",
          });
          unlock();
          router.back();
          return;
        }

        walletLogEvent("PIN_ATTEMPT", (Platform.OS as string) === "web" ? "WEB" : "MOBILE", "Failed to unlock wallet with PIN", {
          success: false,
          lockedOut: res.lockedOut,
          remainingMs: res.remainingMs,
        });

        setError(true);
        setTimeout(() => {
          setError(false);
          setPin("");
        }, 800);
      })().catch((e) => {
        console.log("[lock] checkPin error", e);
        setError(true);
        setTimeout(() => {
          setError(false);
          setPin("");
        }, 800);
      });
    }
  }, [PIN_LENGTH, checkPin, hasPin, isReady, pin, unlock, walletLogEvent]);

  const onBiometrics = useCallback(() => {
    console.log("[lock] biometrics pressed", { enabled: isBiometricEnabled });
    if (!isBiometricEnabled) return;
    if (!hasPin) return;
    if (isLockedOut) return;

    if ((Platform.OS as string) === "web") {
      Alert.alert("Biometrics unavailable", "Biometric authentication isn't supported on web. Use your PIN instead.");
      return;
    }

    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        console.log("[lock] biometrics precheck", { hasHardware, isEnrolled });

        if (!hasHardware || !isEnrolled) {
          Alert.alert("Biometrics unavailable", "Set up Face ID / Touch ID (or device biometrics) and try again.");
          walletLogEvent(
            "PIN_ATTEMPT",
            (Platform.OS as string) === "web" ? "WEB" : "MOBILE",
            "Biometrics unavailable",
            { success: false, method: "biometric", hasHardware, isEnrolled }
          );
          return;
        }

        const res = await LocalAuthentication.authenticateAsync({
          promptMessage: "Unlock Ghost Wallet",
          cancelLabel: "Use PIN",
          disableDeviceFallback: false,
        });

        console.log("[lock] biometrics result", res);

        if (!res.success) {
          walletLogEvent(
            "PIN_ATTEMPT",
            (Platform.OS as string) === "web" ? "WEB" : "MOBILE",
            "Biometrics failed",
            { success: false, method: "biometric", error: res.error ?? null }
          );
          return;
        }

        walletLogEvent(
          "PIN_ATTEMPT",
          (Platform.OS as string) === "web" ? "WEB" : "MOBILE",
          "Wallet unlocked successfully with biometrics",
          { success: true, method: "biometric" }
        );
        unlock();
        router.back();
      } catch (e) {
        console.log("[lock] biometrics error", e);
        walletLogEvent(
          "PIN_ATTEMPT",
          (Platform.OS as string) === "web" ? "WEB" : "MOBILE",
          "Biometrics error",
          { success: false, method: "biometric", error: String(e) }
        );
        Alert.alert("Biometrics error", "Couldn't authenticate with biometrics. Please try again or use your PIN.");
      }
    })().catch((e) => {
      console.log("[lock] biometrics async error", e);
    });
  }, [hasPin, isBiometricEnabled, isLockedOut, unlock, walletLogEvent]);

  return (
    <View style={styles.screen} testID="lock-screen">
      <LinearGradient
        colors={["rgba(201,166,106,0.16)", "rgba(11,13,16,0.0)", "rgba(11,13,16,1)"]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.closeBtn, pressed ? { transform: [{ scale: 0.98 }], opacity: 0.9 } : null]}
          testID="lock-close"
          hitSlop={10}
        >
          <X size={18} color={BG.text2} />
        </Pressable>
      </View>

      <View style={styles.header}>
        <View style={styles.brandIcon}>
          <Ghost size={24} color={BG.accent} />
        </View>
        <Text style={styles.title}>Enter PIN</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.center}>
        <PinInput
          pin={pin}
          onPinChange={setPin}
          pinLength={PIN_LENGTH}
          error={error}
          disabled={!isReady || !hasPin || isLockedOut}
          testID="lock-pin-input"
        />
      </View>

      <View style={styles.footer}>
        {isBiometricEnabled && hasPin && !isLockedOut ? (
          <Pressable
            onPress={onBiometrics}
            style={({ pressed }) => [styles.bioBtn, pressed ? { transform: [{ scale: 0.98 }], opacity: 0.9 } : null]}
            testID="lock-biometrics"
          >
            <Fingerprint size={22} color={BG.text2} />
            <Text style={styles.bioText}>USE BIOMETRICS</Text>
          </Pressable>
        ) : (
          <View style={{ height: 54 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG.bg },
  topBar: {
    paddingHorizontal: 18,
    paddingTop: 18,
    alignItems: "flex-end",
  },
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
  header: {
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  brandIcon: {
    width: 54,
    height: 54,
    borderRadius: 22,
    backgroundColor: "rgba(201,166,106,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,166,106,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: { color: BG.text, fontSize: 22, fontWeight: "900", letterSpacing: -0.3 },
  subtitle: { color: BG.text2, fontSize: 12, fontWeight: "700", marginTop: 6 },
  center: { flex: 1, justifyContent: "center", paddingHorizontal: 18 },
  footer: { paddingHorizontal: 18, paddingBottom: 28, alignItems: "center" },
  bioBtn: {
    height: 54,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: BG.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bioText: {
    color: BG.text2,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.4,
  },
});
