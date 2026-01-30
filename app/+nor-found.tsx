import React from "react";
import { Link, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

const BG = Colors.ghost;

export default function NotFoundScreen() {
  return (
    <View style={styles.screen} testID="not-found-screen">
      <Stack.Screen options={{ title: "Not found" }} />
      <LinearGradient
        colors={["rgba(201,166,106,0.14)", "rgba(11,13,16,0.0)", "rgba(11,13,16,1)"]}
        locations={[0, 0.36, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.card}>
        <Text style={styles.title}>This screen doesn{"'"}t exist.</Text>
        <Text style={styles.sub}>Let{"'"}s get you back to your vault.</Text>

        <Link href="/(tabs)/home" asChild>
          <Pressable style={({ pressed }) => [styles.btn, pressed ? { opacity: 0.92 } : null]} testID="not-found-home">
            <Text style={styles.btnText}>GO HOME</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG.bg,
    padding: 18,
    justifyContent: "center",
  },
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: BG.card,
    borderWidth: 1,
    borderColor: BG.border,
  },
  title: {
    color: BG.text,
    fontWeight: "900",
    fontSize: 18,
  },
  sub: {
    color: BG.text2,
    fontWeight: "600",
    fontSize: 13,
    marginTop: 6,
  },
  btn: {
    marginTop: 14,
    backgroundColor: BG.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: {
    color: BG.accent2,
    fontWeight: "900",
    letterSpacing: 2.5,
    fontSize: 11,
  },
});
