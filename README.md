# 👻 GhostWallet

**GhostWallet** is a secure, non-custodial, cross-chain mobile wallet built for production.

* **Platforms**: iOS & Android (native), optional Web export
* **Architecture**: Non-custodial, client-side key management
* **Workflow**: Expo Bare Workflow
* **Framework**: Expo Router + React Native
* **Language**: TypeScript

GhostWallet is designed with security-first principles, modern mobile performance, and App Store / Play Store compliance in mind.

---

## ✨ Key Features

* 🔐 Secure key storage using OS-level secure enclaves
* 🧬 Biometric authentication (Face ID / Touch ID)
* 🌐 Cross-chain architecture (EVM-ready)
* ⚡ Hermes-enabled production builds
* 🧱 Bare workflow for full native control
* 🧪 Unit + E2E testing (Jest + Detox)
* 🚀 Store-ready configuration for iOS & Android

---

## 🧱 Technology Stack

This project uses a battle-tested mobile stack used by top production apps.

* **React Native** – Cross-platform native mobile framework by Meta
* **Expo (Bare Workflow)** – Native tooling, build system, and APIs
* **Expo Router** – File-based routing with deep link support
* **TypeScript** – End-to-end type safety
* **TanStack Query (React Query)** – Server state management
* **Hermes** – Optimized JavaScript engine for React Native
* **Lucide React Native** – Icon system

---

## 🔐 Security Architecture

GhostWallet follows non-custodial wallet security best practices:

* Private keys are **generated and stored locally only**
* Keys are stored using:

  * **iOS Keychain (Secure Enclave when available)**
  * **Android Keystore (StrongBox when available)**
* Biometric gating for sensitive actions
* No private keys, seed phrases, or signing material ever leave the device

> ⚠️ Backends should never store private keys or recovery phrases.

---

## 🧪 Testing Strategy

GhostWallet includes a full testing stack suitable for production wallets:

### Unit & Integration Testing

* **Jest** – Unit tests
* **React Native Testing Library** – Component testing

### End-to-End Testing

* **Detox** – Native E2E tests on iOS & Android

---

## ⚡ Performance Optimizations

* Hermes JavaScript engine enabled
* Production-only logging
* Dead code elimination
* Metro + Babel production flags
* Tree-shaken dependencies

---

## 🚀 Development

### Install dependencies

```bash
bun install
```

### Start development server

```bash
bun run start
```

### Run on iOS

```bash
bun run ios
```

### Run on Android

```bash
bun run android
```

> Development builds use custom native clients (Expo Dev Client).

---

## 🧱 Bare Workflow

This project uses the **Expo Bare Workflow**, allowing:

* Full native code access
* Custom native SDKs (biometrics, crypto libs)
* App Store–compliant builds

Native folders:

* `ios/`
* `android/`

---

## 🚀 Production Builds

### iOS

* Uses Xcode-managed signing
* Supports Face ID & Secure Enclave
* App Store privacy manifests configured

### Android

* Uses Gradle production builds
* Supports BiometricPrompt & StrongBox
* Play Store target SDK compliance

Build using **EAS Build** or local CI.

---

## 🚀 Advanced Features

### 🗄️ Add a Database

For off-chain data, analytics, or sync:

* **Supabase** – PostgreSQL with real-time features
* **Firebase** – Firestore, Realtime DB, analytics
* **Custom API** – REST or GraphQL

> Never store private keys or seed phrases.

---

### 🔐 Authentication (Optional)

Authentication is optional and **not required** for wallet usage.

#### Expo-Compatible

* **Expo AuthSession** – OAuth providers
* **Supabase Auth** – Email & social login
* **Firebase Auth** – Full auth platform

#### Native (Custom Build)

* **Apple Sign In**
* **Google Sign In**

---

### 🔔 Push Notifications

* **Expo Notifications** – Cross-platform
* **Firebase Cloud Messaging** – Advanced control

Use for transaction alerts and security notifications.

---

### 💳 Payments & Subscriptions

#### Web / Card Payments

* **Stripe** – Payments & subscriptions
* **PayPal** – Checkout

#### Native In-App Purchases

* **RevenueCat** – Cross-platform IAP
* **Expo In-App Purchases** – Direct store billing

---

## 🌍 Deep Linking & Domains

### Web

* EAS Hosting
* Netlify
* Vercel

### Mobile

Configured via `app.json`:

* iOS Universal Links
* Android App Links

Supports WalletConnect, transaction requests, and external signing flows.

---

## 📦 Store Compliance

GhostWallet is designed to meet:

* Apple App Store crypto wallet guidelines
* Google Play digital asset policies
* Privacy manifest & permission transparency

---

## 📄 License

MIT License
