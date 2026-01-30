import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  children: React.ReactNode;
  testID?: string;
};

type State = {
  hasError: boolean;
  errorMessage: string | null;
};

export class ErrorBoundary extends React.PureComponent<Props, State> {
  state: State = { hasError: false, errorMessage: null };

  static getDerivedStateFromError(error: unknown): State {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { hasError: true, errorMessage: msg };
  }

  componentDidCatch(error: unknown) {
    if (__DEV__) {
      console.log("[ErrorBoundary] caught", error);
    }
  }

  render() {
    const { hasError, errorMessage } = this.state;
    if (!hasError) return this.props.children;

    return (
      <View style={styles.screen} testID={this.props.testID ?? "error-boundary"}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle} numberOfLines={4}>
          {errorMessage ?? "Unexpected error"}
        </Text>
        <Pressable
          onPress={() => this.setState({ hasError: false, errorMessage: null })}
          style={({ pressed }) => [styles.button, pressed ? { transform: [{ scale: 0.99 }], opacity: 0.9 } : null]}
          testID="error-retry"
        >
          <Text style={styles.buttonText}>RETRY</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    backgroundColor: "#0B0D10",
    justifyContent: "center",
    gap: 10,
  },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", letterSpacing: -0.2 },
  subtitle: { color: "rgba(255,255,255,0.72)", fontSize: 12, fontWeight: "700" },
  button: {
    marginTop: 10,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#FFFFFF", fontWeight: "900", fontSize: 11, letterSpacing: 2.4 },
});
