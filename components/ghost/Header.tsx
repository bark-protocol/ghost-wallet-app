import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageSquare, Bell, Scan, Ghost } from "lucide-react-native";

import Colors from "@/constants/colors";

const BG = Colors.ghost;

export function Header(props: {
  title: string;
  subtitle: string;
  rightPillLabel?: string;
  onRightPillPress?: () => void;
  testID?: string;
}) {
  const { title, subtitle, rightPillLabel, onRightPillPress, testID } = props;

  return (
    <View style={styles.wrap} testID={testID ?? "ghost-header"}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.row}>
          <View style={styles.left}>
            <View style={styles.brandIcon}>
              <Ghost size={18} color={BG.accent} />
            </View>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            {rightPillLabel ? (
              <Pressable
                onPress={onRightPillPress}
                style={({ pressed }) => [
                  styles.pill,
                  pressed ? { opacity: 0.9, transform: [{ scale: 0.98 }] } : null,
                ]}
                testID="header-pill"
              >
                <Text style={styles.pillText}>{rightPillLabel}</Text>
              </Pressable>
            ) : null}

            <IconButton
              onPress={() => console.log("[header] ai pressed", { platform: Platform.OS })}
              icon={<MessageSquare size={18} color={BG.accent} />}
              testID="header-ai"
            />
            <IconButton
              onPress={() => console.log("[header] scan pressed")}
              icon={<Scan size={18} color={BG.text2} />}
              testID="header-scan"
            />
            <IconButton
              onPress={() => console.log("[header] notifications pressed")}
              icon={<Bell size={18} color={BG.text2} />}
              testID="header-bell"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function IconButton(props: {
  onPress: () => void;
  icon: React.ReactNode;
  testID: string;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => [styles.iconBtn, pressed ? { transform: [{ scale: 0.96 }] } : null]}
      testID={props.testID}
      hitSlop={10}
    >
      {props.icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "rgba(11,13,16,0.86)",
    borderBottomWidth: 1,
    borderBottomColor: BG.border,
  },
  safe: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 16,
    backgroundColor: "rgba(201,166,106,0.10)",
    borderWidth: 1,
    borderColor: "rgba(201,166,106,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: BG.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  subtitle: {
    color: BG.text2,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: BG.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(201,166,106,0.10)",
    borderWidth: 1,
    borderColor: "rgba(201,166,106,0.18)",
  },
  pillText: {
    color: BG.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.1,
    textTransform: "uppercase",
  },
});
