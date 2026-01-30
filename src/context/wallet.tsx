import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

export type WalletLogEventType = "PIN_ATTEMPT" | "SETTINGS_CHANGE" | "LOCK";
export type WalletLogSource = "MOBILE" | "WEB";

type WalletState = {
  pinHash: string | null;
  isLocked: boolean;
  isBiometricEnabled: boolean;
};

type WalletContextValue = {
  isReady: boolean;
  isLocked: boolean;
  isBiometricEnabled: boolean;

  setBiometricsEnabled: (enabled: boolean) => void;

  setPin: (pin: string) => Promise<void>;
  checkPin: (pin: string) => boolean;

  lock: () => void;
  unlock: () => void;

  walletLogEvent: (
    type: WalletLogEventType,
    source: WalletLogSource,
    message: string,
    metadata?: Record<string, unknown>
  ) => void;
};

const STORAGE_KEY = "ghost_wallet_state_v1";

function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i += 1) {
    hash = (hash * 31 + pin.charCodeAt(i)) >>> 0;
  }
  return `v1_${hash.toString(16)}`;
}

async function loadState(): Promise<WalletState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WalletState>;

    return {
      pinHash: typeof parsed.pinHash === "string" ? parsed.pinHash : null,
      isLocked: typeof parsed.isLocked === "boolean" ? parsed.isLocked : true,
      isBiometricEnabled: typeof parsed.isBiometricEnabled === "boolean" ? parsed.isBiometricEnabled : true,
    };
  } catch (e) {
    console.log("[wallet] loadState error", e);
    return null;
  }
}

async function saveState(next: WalletState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.log("[wallet] saveState error", e);
  }
}

export const [WalletProvider, useWallet] = createContextHook<WalletContextValue>(() => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [pinHash, setPinHash] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      console.log("[wallet] init");
      const stored = await loadState();
      if (!mounted) return;

      if (stored) {
        console.log("[wallet] hydrated", {
          hasPin: Boolean(stored.pinHash),
          isLocked: stored.isLocked,
          isBiometricEnabled: stored.isBiometricEnabled,
        });
        setPinHash(stored.pinHash);
        setIsLocked(stored.isLocked);
        setIsBiometricEnabled(stored.isBiometricEnabled);
      } else {
        console.log("[wallet] no stored state, using defaults");
      }

      setIsReady(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(
    async (next: Partial<WalletState>) => {
      const merged: WalletState = {
        pinHash: next.pinHash ?? pinHash,
        isLocked: next.isLocked ?? isLocked,
        isBiometricEnabled: next.isBiometricEnabled ?? isBiometricEnabled,
      };
      await saveState(merged);
    },
    [pinHash, isLocked, isBiometricEnabled]
  );

  const walletLogEvent = useCallback(
    (type: WalletLogEventType, source: WalletLogSource, message: string, metadata?: Record<string, unknown>) => {
      console.log("[wallet:event]", { type, source, message, metadata });
    },
    []
  );

  const setBiometricsEnabled = useCallback(
    (enabled: boolean) => {
      console.log("[wallet] setBiometricsEnabled", { enabled });
      setIsBiometricEnabled(enabled);
      persist({ isBiometricEnabled: enabled }).catch((e) => console.log("[wallet] persist biometrics error", e));
      walletLogEvent("SETTINGS_CHANGE", "MOBILE", "Biometrics toggled", { setting: "biometrics", value: enabled });
    },
    [persist, walletLogEvent]
  );

  const setPin = useCallback(
    async (pin: string) => {
      const nextHash = hashPin(pin);
      console.log("[wallet] setPin", { pinLength: pin.length });
      setPinHash(nextHash);
      setIsLocked(false);
      await saveState({ pinHash: nextHash, isLocked: false, isBiometricEnabled });
    },
    [isBiometricEnabled]
  );

  const checkPin = useCallback(
    (pin: string) => {
      const ok = Boolean(pinHash) && hashPin(pin) === pinHash;
      console.log("[wallet] checkPin", { ok, pinLength: pin.length, hasPin: Boolean(pinHash) });
      return ok;
    },
    [pinHash]
  );

  const lock = useCallback(() => {
    console.log("[wallet] lock");
    setIsLocked(true);
    persist({ isLocked: true }).catch((e) => console.log("[wallet] persist lock error", e));
    walletLogEvent("LOCK", "MOBILE", "Wallet locked", { isLocked: true });
  }, [persist, walletLogEvent]);

  const unlock = useCallback(() => {
    console.log("[wallet] unlock");
    setIsLocked(false);
    persist({ isLocked: false }).catch((e) => console.log("[wallet] persist unlock error", e));
  }, [persist]);

  return useMemo<WalletContextValue>(
    () => ({
      isReady,
      isLocked,
      isBiometricEnabled,
      setBiometricsEnabled,
      setPin,
      checkPin,
      lock,
      unlock,
      walletLogEvent,
    }),
    [isReady, isLocked, isBiometricEnabled, setBiometricsEnabled, setPin, checkPin, lock, unlock, walletLogEvent]
  );
});
