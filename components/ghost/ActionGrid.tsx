import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowDownToLine, ArrowUpRight, Sparkles, QrCode } from "lucide-react-native";

import Colors from "@/constants/colors";

const BG = Colors.ghost;

type Action = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

export function ActionGrid(props: { testID?: string }) {
  const router = useRouter();

  const actions = useMemo<Action[]>(
    () => [
      { id: "receive", label: "Receive", icon: <ArrowDownToLine size={18} color={BG.accent} /> },
      { id: "send", label: "Send", icon: <ArrowUpRight size={18} color={BG.accent} /> },
      { id: "qr", label: "Scan", icon: <QrCode size={18} color={BG.accent} /> },
      { id: "ai", label: "AI", icon: <Sparkles size={18} color={BG.accent} /> },
    ],
    []
  );

  return (
    <View style={styles.wrap} testID={props.testID ?? "action-grid"}>
      {actions.map((a) => (
        <Pressable
          key={a.id}
          onPress={() => {
            console.log("[action] pressed", { id: a.id });
            if (a.id === "receive") {
              router.push("/deposit");
              return;
            }
            if (a.id === "send") {
              console.log("[action] send not implemented yet");
              return;
            }
            if (a.id === "qr") {
              console.log("[action] scan not implemented yet");
              return;
            }
            if (a.id === "ai") {
              console.log("[action] ai not implemented yet");
              return;
            }
          }}
          style={({ pressed }) => [styles.item, pressed ? { transform: [{ scale: 0.99 }] } : null]}
          testID={`action-${a.id}`}
        >
          <View style={styles.icon}>{a.icon}</View>
          <Text style={styles.label}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  item: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: BG.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(201,166,106,0.10)",
    borderWidth: 1,
    borderColor: "rgba(201,166,106,0.18)",
  },
  label: {
    color: BG.text,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
});
