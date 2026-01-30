import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

const BG = Colors.ghost;

type PinInputProps = {
  pin: string;
  onPinChange: (next: string) => void;
  pinLength: number;
  error?: boolean;
  disabled?: boolean;
  testID?: string;
};

const KEYS: { key: string; label: string; value: string | null }[] = [
  { key: "1", label: "1", value: "1" },
  { key: "2", label: "2", value: "2" },
  { key: "3", label: "3", value: "3" },
  { key: "4", label: "4", value: "4" },
  { key: "5", label: "5", value: "5" },
  { key: "6", label: "6", value: "6" },
  { key: "7", label: "7", value: "7" },
  { key: "8", label: "8", value: "8" },
  { key: "9", label: "9", value: "9" },
  { key: "empty", label: "", value: null },
  { key: "0", label: "0", value: "0" },
  { key: "del", label: "⌫", value: "del" },
];

export function PinInput(props: PinInputProps) {
  const { pin, onPinChange, pinLength, error = false, disabled = false, testID } = props;

  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!error) return;
    console.log("[PinInput] error shake");
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [error, shake]);

  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });

  const dots = useMemo(() => {
    return Array.from({ length: pinLength }).map((_, idx) => {
      const filled = idx < pin.length;
      return {
        idx,
        filled,
      };
    });
  }, [pin.length, pinLength]);

  const onKeyPress = (value: string | null) => {
    if (disabled) return;
    if (value === null) return;

    if (value === "del") {
      onPinChange(pin.slice(0, -1));
      return;
    }

    if (pin.length >= pinLength) return;
    onPinChange(pin + value);
  };

  return (
    <View style={styles.wrap} testID={testID ?? "pin-input"}>
      <Animated.View style={[styles.dotsRow, { transform: [{ translateX }] }]} testID="pin-dots">
        {dots.map((d) => (
          <View
            key={d.idx}
            style={[
              styles.dot,
              d.filled ? styles.dotFilled : null,
              error ? styles.dotError : null,
            ]}
          />
        ))}
      </Animated.View>

      <View style={styles.grid} testID="pin-keypad">
        {KEYS.map((k) => {
          const isEmpty = k.value === null;
          const isDel = k.value === "del";
          const isDisabled = disabled || (isEmpty && true);
          const showText = !isEmpty;

          return (
            <Pressable
              key={k.key}
              onPress={() => onKeyPress(k.value)}
              disabled={isEmpty || disabled}
              style={({ pressed }) => [
                styles.key,
                pressed && !isDisabled ? styles.keyPressed : null,
                isDel ? styles.keyDel : null,
                disabled ? { opacity: 0.6 } : null,
              ]}
              testID={`pin-key-${k.key}`}
            >
              {showText ? (
                <Text style={[styles.keyText, isDel ? styles.keyTextDel : null]}>{k.label}</Text>
              ) : (
                <View />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", alignItems: "center" },
  dotsRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: BG.border,
  },
  dotFilled: {
    backgroundColor: BG.accent,
    borderColor: "rgba(201,166,106,0.55)",
  },
  dotError: {
    borderColor: "rgba(255,77,77,0.55)",
  },
  grid: {
    width: "100%",
    maxWidth: 320,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  key: {
    width: 92,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: BG.border,
    alignItems: "center",
    justifyContent: "center",
  },
  keyPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  keyDel: {
    backgroundColor: "rgba(201,166,106,0.10)",
    borderColor: "rgba(201,166,106,0.22)",
  },
  keyText: {
    color: BG.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },
  keyTextDel: {
    color: BG.accent,
    fontSize: 16,
  },
});
