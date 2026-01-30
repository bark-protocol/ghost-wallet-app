import React from "react";
import { View } from "react-native";
import { Bitcoin, Coins, Diamond, Droplet, Sparkles } from "lucide-react-native";

import Colors from "@/constants/colors";

export type TokenId = "GHOST" | "SOL" | "USDC" | "BTC" | "ETH" | "SUI";

const BG = Colors.ghost;

const iconProps = { size: 18, color: BG.accent } as const;

export const ASSETS: Record<
  TokenId,
  {
    name: string;
    ticker: string;
    icon: React.ReactNode;
  }
> = {
  GHOST: { name: "Ghost", ticker: "GHOST", icon: <Sparkles {...iconProps} /> },
  SOL: { name: "Solana", ticker: "SOL", icon: <Droplet {...iconProps} /> },
  SUI: { name: "Sui Network", ticker: "ETH", icon: <Diamond {...iconProps} /> },
  USDC: { name: "USD Coin", ticker: "USDC", icon: <Coins {...iconProps} /> },
  BTC: { name: "Bitcoin", ticker: "BTC", icon: <Bitcoin {...iconProps} /> },
  ETH: { name: "Ethereum", ticker: "ETH", icon: <Diamond {...iconProps} /> },
};

export function AssetIconWrap(props: { children: React.ReactNode; testID?: string }) {
  return (
    <View
      testID={props.testID}
      style={{
        width: 38,
        height: 38,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {props.children}
    </View>
  );
}
