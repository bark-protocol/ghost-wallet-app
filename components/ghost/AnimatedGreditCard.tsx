import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Wifi, Ghost } from "lucide-react-native";


type Provider = "stripe" | "moonpay";

type AnimatedCreditCardProps = {
  provider: Provider;
  last4: string;
  expiry: string;
  holder: string;
  testID?: string;
};

export function AnimatedCreditCard(props: AnimatedCreditCardProps) {
  const { provider, last4, expiry, holder, testID } = props;

  const [layout, setLayout] = useState<{ w: number; h: number }>({ w: 320, h: 220 });

  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const glareX = useRef(new Animated.Value(0.5)).current;
  const glareY = useRef(new Animated.Value(0.5)).current;

  const reset = useCallback(() => {
    console.log("[credit-card] reset tilt");
    Animated.parallel([
      Animated.spring(tiltX, { toValue: 0, useNativeDriver: true, friction: 8, tension: 90 }),
      Animated.spring(tiltY, { toValue: 0, useNativeDriver: true, friction: 8, tension: 90 }),
      Animated.timing(glareX, { toValue: 0.5, duration: 180, useNativeDriver: false }),
      Animated.timing(glareY, { toValue: 0.5, duration: 180, useNativeDriver: false }),
    ]).start();
  }, [glareX, glareY, tiltX, tiltY]);

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        console.log("[credit-card] grant");
      },
      onPanResponderMove: (_, gesture) => {
        const w = Math.max(1, layout.w);
        const h = Math.max(1, layout.h);

        const nx = (gesture.x0 + gesture.dx) / w;
        const ny = (gesture.y0 + gesture.dy) / h;

        const clampedX = Math.max(0, Math.min(1, nx));
        const clampedY = Math.max(0, Math.min(1, ny));

        glareX.setValue(clampedX);
        glareY.setValue(clampedY);

        const centeredX = (clampedX - 0.5) * 2;
        const centeredY = (clampedY - 0.5) * 2;

        tiltY.setValue(centeredX);
        tiltX.setValue(-centeredY);
      },
      onPanResponderRelease: () => reset(),
      onPanResponderTerminate: () => reset(),
    });
  }, [glareX, glareY, layout.h, layout.w, reset, tiltX, tiltY]);

  const rotateX = tiltX.interpolate({
    inputRange: [-1, 1],
    outputRange: ["10deg", "-10deg"],
  });

  const rotateY = tiltY.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-12deg", "12deg"],
  });

  const glareLeft = glareX.interpolate({
    inputRange: [0, 1],
    outputRange: ["-20%", "60%"],
  });

  const glareTop = glareY.interpolate({
    inputRange: [0, 1],
    outputRange: ["-30%", "50%"],
  });

  const providerLabel = provider === "stripe" ? "STRIPE" : "MOONPAY";

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!width || !height) return;
    setLayout({ w: width, h: height });
  }, []);

  return (
    <View style={styles.wrap} testID={testID ?? "animated-credit-card"}>
      <Pressable
        onPress={() => console.log("[credit-card] pressed", { provider, last4 })}
        style={styles.pressable}
        {...panResponder.panHandlers}
      >
        <Animated.View
          onLayout={onLayout}
          style={[
            styles.card,
            Platform.OS === "web" ? (styles.webShadow as never) : null,
            {
              transform: [
                { perspective: 1000 },
                { rotateX },
                { rotateY },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={["#C9A66A", "#1B1206"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.noise} />

          <Animated.View
            pointerEvents="none"
            style={[
              styles.glare,
              {
                left: glareLeft,
                top: glareTop,
              },
            ]}
          />

          <View style={styles.content}>
            <View style={styles.topRow}>
              <View style={styles.chip} />
              <View style={styles.contactless}>
                <Wifi size={22} color={"rgba(255,255,255,0.86)"} style={{ transform: [{ rotate: "90deg" }] }} />
              </View>
            </View>

            <View style={styles.middle}>
              <Text style={styles.cardNumber} numberOfLines={1}>
                ••••   ••••   ••••   {last4}
              </Text>

              <View style={styles.bottomRow}>
                <View style={styles.col}>
                  <Text style={styles.label}>CARD HOLDER</Text>
                  <Text style={styles.value} numberOfLines={1}>
                    {holder}
                  </Text>
                </View>

                <View style={[styles.col, { alignItems: "flex-end" }]}>
                  <Text style={styles.label}>EXPIRES</Text>
                  <Text style={styles.valueMono}>{expiry}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.watermark} pointerEvents="none">
            <Ghost size={140} color={"rgba(255,255,255,0.10)"} />
          </View>

          <View style={styles.providerTag} pointerEvents="none">
            <Text style={styles.providerText}>{providerLabel}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    paddingVertical: 8,
  },
  pressable: {
    width: "100%",
  },
  card: {
    height: 224,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "#000",
  },
  webShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  noise: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.03)",
    opacity: 0.7,
  },
  glare: {
    position: "absolute",
    width: "70%",
    height: "80%",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    transform: [{ rotate: "-18deg" }],
  },
  content: {
    flex: 1,
    padding: 18,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  chip: {
    width: 44,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255, 215, 128, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.18)",
  },
  contactless: {
    width: 40,
    height: 40,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  middle: {
    gap: 18,
  },
  cardNumber: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 2.4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  col: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2.2,
  },
  value: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  valueMono: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  watermark: {
    position: "absolute",
    right: -32,
    bottom: -28,
    opacity: 0.9,
  },
  providerTag: {
    position: "absolute",
    right: 16,
    top: 16,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  providerText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2.4,
  },
});
