import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, ChevronDown, Copy, Info, Share2 } from "lucide-react-native";

import Colors from "@/constants/colors";
import { ASSETS, type TokenId } from "@/mocks/ghostAssets";

const BG = Colors.ghost;

function buildQrUrl(value: string, size: number) {
  const encoded = encodeURIComponent(value);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=png&data=${encoded}`;
}

function shortAddress(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-5)}`;
}

export default function DepositScreen() {
  const router = useRouter();

  const userAddress = "GHOST7v1...9xP2";

  const [selectedToken, setSelectedToken] = useState<TokenId>("SOL");
  const [selectorOpen, setSelectorOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const copyScale = useRef(new Animated.Value(1)).current;

  const availableTokens = useMemo<TokenId[]>(
    () => (Object.keys(ASSETS) as TokenId[]).filter((t) => t !== "GHOST"),
    []
  );

  const qrValue = useMemo(() => {
    return `solana:${userAddress}?asset=${selectedToken}`;
  }, [selectedToken, userAddress]);

  const qrUrl = useMemo(() => buildQrUrl(qrValue, 320), [qrValue]);

  const doCopy = useCallback(async () => {
    console.log("[deposit] copy pressed", { selectedToken });

    try {
      await Clipboard.setStringAsync(userAddress);
      setCopied(true);

      Animated.sequence([
        Animated.timing(copyScale, { toValue: 0.92, duration: 90, useNativeDriver: true }),
        Animated.spring(copyScale, { toValue: 1, useNativeDriver: true }),
      ]).start();

      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.log("[deposit] copy failed", e);
    }
  }, [copyScale, selectedToken, userAddress]);

  const doShare = useCallback(async () => {
    console.log("[deposit] share pressed", { platform: Platform.OS, selectedToken });

    try {
      const message = `Deposit ${selectedToken} to my Ghost Wallet: ${userAddress}`;

      const result = await Share.share({ message, url: qrValue, title: "Deposit Address" });
      console.log("[deposit] share result", result);
    } catch (e) {
      console.log("[deposit] share failed, fallback to copy", e);
      await doCopy();
    }
  }, [doCopy, qrValue, selectedToken, userAddress]);

  const asset = ASSETS[selectedToken];

  return (
    <View style={styles.screen} testID="deposit-screen">
      <View style={styles.chrome} />
      <SafeAreaView edges={["top"]} style={styles.safeTop}>
        <View style={styles.header} testID="deposit-header">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed ? { transform: [{ scale: 0.96 }] } : null]}
            testID="deposit-back"
            hitSlop={10}
          >
            <ArrowLeft size={20} color={BG.text2} />
          </Pressable>
          <Text style={styles.headerTitle} testID="deposit-title">
            Deposit Assets
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="deposit-scroll"
      >
        <View style={styles.selectorWrap} testID="deposit-selector">
          <Pressable
            onPress={() => setSelectorOpen(true)}
            style={({ pressed }) => [styles.selectorBtn, pressed ? { transform: [{ scale: 0.995 }] } : null]}
            testID="deposit-selector-open"
          >
            <View style={styles.selectorLeft}>
              <View style={styles.assetBadge}>
                <View style={{ opacity: 0.96 }}>{asset.icon}</View>
              </View>
              <View style={{ gap: 3 }}>
                <Text style={styles.selectorLabel}>ASSET</Text>
                <Text style={styles.selectorValue}>{asset.name}</Text>
              </View>
            </View>
            <ChevronDown size={16} color={BG.text2} />
          </Pressable>
        </View>

        <View style={styles.qrCard} testID="deposit-qr-card">
          <View style={styles.qrFrame}>
            <Image
              source={{ uri: qrUrl }}
              style={styles.qrImage}
              contentFit="contain"
              transition={120}
              accessibilityLabel="Deposit QR code"
            />
          </View>

          <View style={styles.networkRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.networkText}>Solana Mainnet</Text>
          </View>
        </View>

        <View style={styles.actions} testID="deposit-actions">
          <View style={styles.addressCard}>
            <View style={styles.addrLeft}>
              <Text style={styles.addrLabel}>WALLET ADDRESS</Text>
              <Text style={styles.addrValue} numberOfLines={1}>
                {userAddress}
              </Text>
              <Text style={styles.addrHint} numberOfLines={1}>
                {shortAddress(userAddress)}
              </Text>
            </View>

            <Animated.View style={{ transform: [{ scale: copyScale }] }}>
              <Pressable
                onPress={doCopy}
                style={({ pressed }) => [
                  styles.iconAction,
                  pressed ? { transform: [{ scale: 0.98 }], opacity: 0.95 } : null,
                ]}
                testID="deposit-copy"
              >
                {copied ? <Check size={18} color={BG.accent} /> : <Copy size={18} color={BG.text2} />}
              </Pressable>
            </Animated.View>
          </View>

          <Pressable
            onPress={doShare}
            style={({ pressed }) => [styles.shareBtn, pressed ? { transform: [{ scale: 0.99 }] } : null]}
            testID="deposit-share"
          >
            <Share2 size={16} color={BG.bg} />
            <Text style={styles.shareText}>Share Address</Text>
          </Pressable>
        </View>

        <View style={styles.warning} testID="deposit-warning">
          <Info size={16} color={"rgba(118,186,255,0.95)"} />
          <Text style={styles.warningText}>
            Only send {selectedToken} assets to this address. Sending other assets or using the wrong network may
            result in permanent loss.
          </Text>
        </View>

        <View style={{ height: 36 }} />
      </ScrollView>

      <Modal
        visible={selectorOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectorOpen(false)}
      >
        <Pressable
          onPress={() => setSelectorOpen(false)}
          style={styles.modalBackdrop}
          testID="deposit-selector-backdrop"
        >
          <View style={styles.sheet} testID="deposit-selector-sheet">
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose asset</Text>
              <Text style={styles.sheetSub}>Select which token you want to receive</Text>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false} testID="deposit-token-list">
              {availableTokens.map((t) => {
                const a = ASSETS[t];
                const selected = t === selectedToken;

                return (
                  <Pressable
                    key={t}
                    onPress={() => {
                      console.log("[deposit] token selected", { token: t });
                      setSelectedToken(t);
                      setSelectorOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.tokenRow,
                      selected ? styles.tokenRowSelected : null,
                      pressed ? { transform: [{ scale: 0.995 }] } : null,
                    ]}
                    testID={`deposit-token-${t}`}
                  >
                    <View style={styles.tokenLeft}>
                      <View style={styles.tokenIcon}>{a.icon}</View>
                      <View style={{ gap: 2 }}>
                        <Text style={styles.tokenSymbol}>{t}</Text>
                        <Text style={styles.tokenName}>{a.name}</Text>
                      </View>
                    </View>

                    {selected ? <Check size={18} color={BG.accent} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG.bg,
  },
  chrome: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG.bg,
  },
  safeTop: {
    backgroundColor: "rgba(11,13,16,0.86)",
  },
  header: {
    height: 56,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: BG.border,
    backgroundColor: "rgba(11,13,16,0.86)",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: BG.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: BG.text,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    gap: 16,
  },
  selectorWrap: {
    zIndex: 5,
  },
  selectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 22,
    backgroundColor: BG.card,
    borderWidth: 1,
    borderColor: BG.border,
  },
  selectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  assetBadge: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  selectorLabel: {
    color: BG.text2,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.2,
  },
  selectorValue: {
    color: BG.text,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.1,
  },
  qrCard: {
    alignSelf: "center",
    width: 300,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.96)",
    padding: 18,
    borderWidth: 4,
    borderColor: "rgba(201,166,106,0.12)",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  qrFrame: {
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    padding: 12,
  },
  qrImage: {
    width: "100%",
    height: 256,
  },
  networkRow: {
    marginTop: 12,
    alignItems: "center",
    gap: 6,
    flexDirection: "row",
    justifyContent: "center",
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: "#22c55e",
  },
  networkText: {
    color: "#0b0d10",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  actions: {
    gap: 12,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BG.card,
    borderWidth: 1,
    borderColor: BG.border,
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 10,
  },
  addrLeft: {
    flex: 1,
    paddingRight: 10,
  },
  addrLabel: {
    color: BG.text2,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2.1,
    marginBottom: 4,
  },
  addrValue: {
    color: BG.text,
    fontSize: 13,
    fontWeight: "800",
  },
  addrHint: {
    color: "rgba(201,166,106,0.85)",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 6,
    letterSpacing: 0.2,
  },
  iconAction: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: BG.border,
    alignItems: "center",
    justifyContent: "center",
  },
  shareBtn: {
    height: 54,
    borderRadius: 18,
    backgroundColor: BG.accent,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: BG.accent,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  shareText: {
    color: BG.bg,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.3,
    textTransform: "uppercase",
  },
  warning: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(118,186,255,0.22)",
    backgroundColor: "rgba(44,132,255,0.06)",
    alignItems: "flex-start",
  },
  warningText: {
    flex: 1,
    color: "rgba(170,214,255,0.86)",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    padding: 16,
    justifyContent: "flex-end",
  },
  sheet: {
    borderRadius: 26,
    backgroundColor: "rgba(18,20,24,0.96)",
    borderWidth: 1,
    borderColor: BG.border,
    padding: 14,
    overflow: "hidden",
  },
  sheetHeader: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 2,
  },
  sheetTitle: {
    color: BG.text,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  sheetSub: {
    color: BG.text2,
    fontSize: 12,
    fontWeight: "600",
  },
  tokenRow: {
    marginTop: 10,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.03)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tokenRowSelected: {
    borderColor: "rgba(201,166,106,0.25)",
    backgroundColor: "rgba(201,166,106,0.08)",
  },
  tokenLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  tokenSymbol: {
    color: BG.text,
    fontSize: 13,
    fontWeight: "900",
  },
  tokenName: {
    color: BG.text2,
    fontSize: 11,
    fontWeight: "700",
  },
});
