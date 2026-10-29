# EnergyStation web

Web page works with energy station contracts

## Contracts and detail

[EnergyStation](https://github.com/libotony/energy-station)

## Development

### Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Checks TypeScript
```
npm run typecheck
```

## Wallet integration

VeChain Kit 2 runs in a small React root mounted by `src/components/nav-bar.vue`.
The rest of the application stays in Vue. The Kit wallet button handles connecting,
selecting accounts, persistence and disconnecting with VeWorld or Sync2.
`src/wallet/index.tsx` mirrors only the active Kit address into the Vue store.
The old certificate-based account linking and `linked-addr` session are no longer used.

Both Kit and the read-only Connex client use the testnet configuration in
`src/wallet/network.ts`. Keep this on testnet: the configured EnergyStation contract
is not deployed on mainnet.

Transactions use `useDAppKitWallet().requestTransaction`, re-exported by VeChain Kit.
This wallet-only integration preserves the transaction ID, signer, comments and
callback URL, along with the existing optional confirmation flow. Social login is
not enabled; adding it requires migrating this adapter to `useSendTransaction`.

VTHO approval is checked again before submission and cleared on account changes.
No signing request is made without a connected account. The service also rejects
stale accounts and concurrent requests.

The build uses Vue CLI 5 / Webpack 5 and TypeScript 5 for Kit's current package exports.
Browser Node polyfills support the existing Connex/Thor dependencies.

## GitHub Pages

Site: https://ifavo.github.io/energy-station-web/

Pushes to `master` run `.github/workflows/pages.yml`: install dependencies, check
TypeScript, test, build and publish `dist` through GitHub Pages. The workflow can
also be started manually from the Actions tab. Pages uses GitHub Actions as its
publishing source; no deployment token or separate `gh-pages` branch is needed.

The workflow passes the Pages base path to Vue CLI so assets, the hash router,
wallet callback links and the service worker stay under `/energy-station-web/`.
For a local Pages build:

```sh
DEPLOY_BASE_PATH=/energy-station-web/ npm run build
```

The published application uses VeChain testnet.
