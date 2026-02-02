# Ghost Wallet - Mobile Wallet

Solana-based mobile wallet application built with React Native.

## Features

- Multi-language support (EN, DE, FI, FR, RU, SV, ET)
- Solana blockchain integration
- AI-powered chat assistance
- DeFi integrations
- Token swaps with Jupiter
- On-ramp support (MoonPay, Stripe)
- Batch send transactions
- WalletConnect support
- Secure PIN protection

## Structure

```
src/
├── screens/         # Main app screens
├── components/      # Reusable components
├── hooks/          # Custom React hooks
├── context/        # React context providers
├── lib/            # Utility libraries
├── locales/        # i18n translations
├── navigation/     # Navigation setup
├── ui/             # UI components
└── utils/          # Helper functions
```

## Development

This is a React Native application. To run:

1. Install dependencies: `pnpm install`
2. Run on iOS: `npx react-native run-ios`
3. Run on Android: `npx react-native run-android`

## Notes

This package is part of the Ghost Wallet monorepo.
