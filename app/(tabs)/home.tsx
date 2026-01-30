import React, { useCallback, useMemo, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Layers, Loader2, X, CheckCircle2, ShieldAlert } from "lucide-react-native";

import Colors from "@/constants/colors";
import { AssetListItem } from "@/components/ghost/AssetListItem";
import { TotalBalance } from "@/components/ghost/TotalBalance";
import { Header } from "@/components/ghost/Header";
import { ActionGrid } from "@/components/ghost/ActionGrid";
import { ASSETS, type TokenId } from "@/mocks/ghostAssets";

type StepStatus = "idle" | "processing" | "success" | "error";

type MintStep = {
  id: string;
  label: string;
  status: StepStatus;
};

const BG = Colors.ghost;

export default function HomeScreen() {
  const [isBalancesHidden, setIsBalancesHidden] = useState<boolean>(false);
  const [showMintModal, setShowMintModal] = useState<boolean>(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [balances] = useState<Record<TokenId, number>>({
    GHOST: 1324.53,
    SOL: 6.28,
    USDC: 247.19,
    BTC: 0.0042,
    ETH: 0.11,
  });

  const [prices] = useState<Record<TokenId, number>>({
    GHOST: 0.18,
    SOL: 98.22,
    USDC: 1,
    BTC: 43421.12,
    ETH: 2331.8,
  });

  const totalPortfolioValue = useMemo(() => {
    const keys = Object.keys(balances) as TokenId[];
    return keys.reduce((acc, token) => acc + (balances[token] ?? 0) * (prices[token] ?? 0), 0);
  }, [balances, prices]);

  const [steps, setSteps] = useState<MintStep[]>([
    { id: "wallet", label: "VERIFY VAULT", status: "idle" },
    { id: "fees", label: "CALCULATE FEES", status: "idle" },
    { id: "sign", label: "SIGN TX", status: "idle" },
    { id: "final", label: "FINALIZE MINT", status: "idle" },
  ]);

  const resetMint = useCallback(() => {
    setSignature(null);
    setError(null);
    setSteps((prev) => prev.map((s) => ({ ...s, status: "idle" })));
  }, []);

  const runMint = useCallback(async () => {
    console.log("[mint] start");
    resetMint();
    setShowMintModal(true);

    const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const setStatus = (id: string, status: StepStatus) => {
      setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    };

    try {
      setStatus("wallet", "processing");
      await delay(700);
      setStatus("wallet", "success");

      setStatus("fees", "processing");
      await delay(650);
      setStatus("fees", "success");

      setStatus("sign", "processing");
      await delay(900);
      setStatus("sign", "success");

      setStatus("final", "processing");
      await delay(1100);

      const fakeSig = `GHOST_${Math.random().toString(16).slice(2).toUpperCase()}_${Date.now()}`;
      setSignature(fakeSig);
      setStatus("final", "success");
      console.log("[mint] success", { signature: fakeSig });
    } catch (e) {
      console.log("[mint] error", e);
      setError("Mint failed. Please try again.");
      setStatus("final", "error");
    }
  }, [resetMint]);

  const isMinting = useMemo(() => steps.some((s) => s.status === "processing"), [steps]);

  return (
    <View style={styles.screen} testID="home-screen">
      <LinearGradient
        colors={["rgba(201,166,106,0.18)", "rgba(11,13,16,0)", "rgba(11,13,16,1)"]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Header
        title="Vault"
        subtitle="Manage Assets"
        rightPillLabel={isBalancesHidden ? "Show" : "Hide"}
        onRightPillPress={() => setIsBalancesHidden((v) => !v)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID="home-scroll"
      >
        <View style={styles.balanceWrap}>
          <TotalBalance
            balances={balances}
            prices={prices}
            hidden={isBalancesHidden}
            testID="total-balance"
          />
        </View>

        <ActionGrid testID="action-grid" />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>HOLDINGS</Text>
          <Pressable
            onPress={runMint}
            disabled={isMinting}
            style={({ pressed }) => [
              styles.mintButton,
              pressed && !isMinting ? { transform: [{ scale: 0.98 }] } : null,
              isMinting ? { opacity: 0.6 } : null,
            ]}
            testID="mint-button"
          >
            <View style={styles.mintButtonInner}>
              {isMinting ? <Loader2 size={14} color={BG.accent} /> : <Layers size={14} color={BG.accent} />}
              <Text style={styles.mintButtonText}>{isMinting ? "PROTOCOL SYNC" : "MINT GENESIS"}</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.list} testID="asset-list">
          {(Object.keys(ASSETS) as TokenId[]).map((token) => (
            <AssetListItem
              key={token}
              token={token}
              balance={balances[token] ?? 0}
              price={prices[token] ?? 0}
              totalPortfolioValue={totalPortfolioValue}
              hidden={isBalancesHidden}
              testID={`asset-${token}`}
            />
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <MintModal
        visible={showMintModal}
        onClose={() => {
          if (isMinting) return;
          setShowMintModal(false);
        }}
        steps={steps}
        signature={signature}
        error={error}
        isMinting={isMinting}
        onReturn={() => setShowMintModal(false)}
      />
    </View>
  );
}

function MintModal(props: {
  visible: boolean;
  onClose: () => void;
  steps: MintStep[];
  signature: string | null;
  error: string | null;
  isMinting: boolean;
  onReturn: () => void;
}) {
  const { visible, onClose, steps, signature, error, isMinting, onReturn } = props;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translate = React.useRef(new Animated.Value(12)).current;

  React.useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      translate.setValue(12);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(translate, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [opacity, translate, visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalBackdrop} testID="mint-modal">
        <Animated.View style={[styles.modalCard, { opacity, transform: [{ translateY: translate }] }]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <View style={styles.modalIcon}>
                <Layers size={18} color={BG.accent} />
              </View>
              <Text style={styles.modalTitle}>GENESIS MINT</Text>
            </View>
            <Pressable
              onPress={onClose}
              disabled={isMinting}
              hitSlop={10}
              style={({ pressed }) => [
                styles.closeButton,
                isMinting ? { opacity: 0 } : null,
                pressed ? { transform: [{ scale: 0.96 }] } : null,
              ]}
              testID="mint-close"
            >
              <X size={18} color={BG.text} />
            </Pressable>
          </View>

          <View style={styles.steps}>
            {steps.map((s) => (
              <View key={s.id} style={[styles.stepRow, s.status === "idle" ? { opacity: 0.5 } : null]}>
                <View
                  style={[
                    styles.stepDot,
                    s.status === "success" ? { backgroundColor: BG.success, borderColor: BG.success } : null,
                    s.status === "processing" ? { borderColor: BG.accent } : null,
                    s.status === "error" ? { backgroundColor: BG.danger, borderColor: BG.danger } : null,
                  ]}
                >
                  {s.status === "success" ? <CheckCircle2 size={14} color={"#0B0D10"} /> : null}
                  {s.status === "processing" ? <Loader2 size={14} color={BG.accent} /> : null}
                  {s.status === "error" ? <ShieldAlert size={14} color={"#0B0D10"} /> : null}
                  {s.status === "idle" ? <View style={styles.stepIdleInner} /> : null}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    s.status === "processing" ? { color: BG.accent } : null,
                    s.status === "success" ? { color: BG.text } : null,
                  ]}
                >
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {signature ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>MINT FINALIZED</Text>
              <Text style={styles.sigText} numberOfLines={1}>
                {signature}
              </Text>
              <Pressable
                onPress={onReturn}
                style={({ pressed }) => [styles.primaryBtn, pressed ? { transform: [{ scale: 0.99 }] } : null]}
                testID="mint-return"
              >
                <Text style={styles.primaryBtnText}>RETURN TO VAULT</Text>
              </Pressable>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={onClose} style={styles.secondaryBtn} testID="mint-error-close">
                <Text style={styles.secondaryBtnText}>CLOSE</Text>
              </Pressable>
            </View>
          ) : null}

          {!signature && !error ? (
            <View style={styles.miniHint}>
              <Text style={styles.miniHintText}>This is a demo flow. No real transaction is sent.</Text>
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG.bg,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 120,
  },
  balanceWrap: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: "900",
    color: BG.text2,
  },
  mintButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BG.border,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  mintButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mintButtonText: {
    fontSize: 10,
    letterSpacing: 2.2,
    fontWeight: "800",
    color: BG.accent,
  },
  list: {
    gap: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 18,
    justifyContent: "center",
  },
  modalCard: {
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BG.border,
    backgroundColor: BG.card,
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BG.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(201,166,106,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.5,
    color: BG.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  steps: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: BG.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIdleInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2.2,
    color: BG.text,
  },
  successBox: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  successTitle: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.2,
    color: BG.success,
    marginBottom: 8,
  },
  sigText: {
    fontSize: 11,
    color: BG.text2,
    fontWeight: "600",
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: BG.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    color: BG.accent2,
    fontWeight: "900",
    letterSpacing: 2.5,
    fontSize: 11,
  },
  errorBox: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  errorText: {
    color: BG.danger,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
    textAlign: "center",
    marginBottom: 12,
  },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BG.border,
  },
  secondaryBtnText: {
    color: BG.text,
    fontWeight: "900",
    letterSpacing: 2.5,
    fontSize: 11,
  },
  miniHint: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  miniHintText: {
    color: BG.text3,
    fontSize: 11,
    textAlign: "center",
  },
});
