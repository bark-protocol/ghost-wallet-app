import React, { useMemo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import Colors from "@/constants/colors";

const BG = Colors.ghost;

type ButtonVariant = "primary" | "secondary" | "ghost";

type GhostButtonProps = {
  variant?: ButtonVariant;
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export function Button(props: GhostButtonProps) {
  const { variant = "primary", title, onPress, disabled, style, testID } = props;

  const scale = useRef(new Animated.Value(1)).current;

  const palette = useMemo(() => {
    if (variant === "primary") {
      return {
        bg: BG.accent,
        text: BG.accent2,
        border: "rgba(255,255,255,0.12)",
      };
    }

    if (variant === "secondary") {
      return {
        bg: "rgba(255,255,255,0.08)",
        text: BG.text,
        border: "rgba(255,255,255,0.16)",
      };
    }

    return {
      bg: "transparent",
      text: BG.text2,
      border: "transparent",
    };
  }, [variant]);

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          {
            backgroundColor: palette.bg,
            borderColor: palette.border,
            opacity: disabled ? 0.55 : 1,
          },
          pressed && !disabled ? styles.pressed : null,
        ]}
        onPressIn={() => {
          if (disabled) return;
          console.log("[Button] pressIn", { variant, title });
          Animated.timing(scale, { toValue: 0.98, duration: 90, useNativeDriver: true }).start();
        }}
        onPressOut={() => {
          Animated.timing(scale, { toValue: 1, duration: 140, useNativeDriver: true }).start();
        }}
        testID={testID ?? "ghost-button"}
      >
        <Text style={[styles.text, { color: palette.text }]} numberOfLines={1}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pressed: {
    transform: [{ translateY: 1 }],
  },
  text: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.6,
    textTransform: "uppercase",
  },
});
