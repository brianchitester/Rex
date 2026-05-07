# Rex

A web3 music recommendation app built on onchain data. **Winner of the Zora Metabolism Hackathon, 2022.**

> Connect a wallet, browse music from across the web3 music ecosystem, get recommendations driven by in-browser audio analysis, and tip artists onchain.

## Demo

The hackathon presentation video is on YouTube — the Rex segment starts at **37:43**:

[Watch the demo](https://www.youtube.com/watch?v=rDYgFaO63XA&t=2263s) · [Full Metabolism Finale](https://www.youtube.com/watch?v=rDYgFaO63XA)

## What it does

- **Connect your wallet** (Ethereum mainnet or Polygon) via [RainbowKit](https://www.rainbowkit.com/) + [wagmi](https://wagmi.sh/).
- **Browse onchain music** aggregated through [Spinamp](https://spinamp.xyz/) — tracks, artists, and platforms (Catalog, Sound.xyz, Nina, etc.) all queryable through one GraphQL surface.
- **Get track recommendations** driven by audio similarity (see *How recommendations work* below).
- **View by owner** — see the music in any wallet's collection.
- **View by artist or platform** — drill in by web3 music label/platform.
- **Tip artists onchain** through a custom upgradeable Solidity contract supporting ERC20 payments (WIP at hackathon end — see `contracts/Tipping-wip.sol`).
- **Persistent global player** that keeps playing across navigation.

## How recommendations work

Each track's audio is fetched from Spinamp, decoded, and downsampled to 16 kHz mono with `wave-resampler`, then fed through [YAMNet](https://tfhub.dev/google/yamnet/1) — Google's pretrained audio event classifier — running entirely in the browser via [TensorFlow.js](https://www.tensorflow.org/js).

YAMNet outputs scores across [AudioSet](https://research.google.com/audioset/ontology/index.html)'s 521-class ontology. Each track's resulting **521-dimensional feature vector** is persisted to Firebase Firestore.

To recommend: pull the seed track's vector, compute Euclidean distance to every other cached vector, and return the nearest five (`ml-distance-euclidean`).

Custom taxonomies in `src/ml/classifications.ts` bucket the 521 raw labels into more music-relevant categories (`genreClassification`, `vocalClassifications`, `regionalClassifications`, `typeClasifications`, `emotionClassifications`) for display. Bulk processing of the catalog uses `async-sema` to rate-limit at ~6 rps.

Code: [`src/ml/model.ts`](./src/ml/model.ts) (waveform + inference), [`src/ml/index.ts`](./src/ml/index.ts) (recommendation + bulk run), [`src/ml/firebase.ts`](./src/ml/firebase.ts) (vector cache).

## Stack

**Frontend**
- React 18 + TypeScript
- [MUI](https://mui.com/) (Material UI v5) + styled-components
- React Router (HashRouter for static hosting)

**Web3**
- [wagmi](https://wagmi.sh/) + [RainbowKit](https://www.rainbowkit.com/) for wallet connection
- [ethers](https://docs.ethers.org/v5/) v5
- [Spinamp SDK](https://github.com/spinamp/spinamp-sdk) + [`@spinamp/spinamp-hooks`](https://www.npmjs.com/package/@spinamp/spinamp-hooks) for cross-platform onchain music data
- [`@zoralabs/nft-hooks`](https://www.npmjs.com/package/@zoralabs/nft-hooks) for Zora data
- [Apollo Client](https://www.apollographql.com/docs/react/) + GraphQL
- Alchemy as the default RPC provider

**ML / audio**
- [YAMNet](https://tfhub.dev/google/yamnet/1) audio classifier via [TensorFlow.js](https://www.tensorflow.org/js)
- `euclidean-distance` / `ml-distance-euclidean` for nearest-neighbor similarity
- `wave-resampler` for sample-rate normalization

**Smart contracts**
- Solidity ^0.8.4
- OpenZeppelin upgradeable contracts (UUPS proxy pattern, `OwnableUpgradeable`, `SafeERC20Upgradeable`)
- Hardhat for development

**Persistence**
- Firebase Firestore for cached feature vectors and per-wallet favorites

## Project layout

```
src/
  App.tsx                  # routing, providers (Wagmi, RainbowKit, Apollo, MUI, Spinamp, CurrentTrack)
  apolloClient.ts          # GraphQL client config
  pages/
    Home.tsx               # entry, featured tracks
    TrackList.tsx          # list view
    TrackDetails.tsx       # per-track view + recommendations
    Owner.tsx              # wallet's owned tracks ("My Music")
    Artist.tsx             # artist page
    PlatformTracks.tsx     # tracks by platform (Catalog, Sound.xyz, Nina, …)
    Admin.tsx              # admin / bulk-analysis tooling
  components/
    Nav.tsx
    Player.tsx             # global persistent player
    Recs.tsx               # similarity-driven recommendations
    NinaRecs.tsx           # Nina-platform-specific recs
    ArtistSearch.tsx
  ml/
    model.ts               # YAMNet inference + per-track classification
    classifications.ts     # 521-class AudioSet labels + custom genre/emotion/etc. taxonomies
    spinamp.ts             # Spinamp SDK glue
    firebase.ts            # Firestore vector cache + favorites
    index.ts               # bulk analysis + recommendation logic
  context/
    CurrentTrackContext.tsx  # cross-route player state
  hooks/
  theme.ts                 # MUI theme

contracts/
  Tipping-wip.sol          # TipOffer — UUPS-upgradeable ERC20 tipping contract
```

## Running locally

```bash
npm install
echo "REACT_APP_ALCHEMY_KEY=your_key_here" > .env
npm start
```

The app runs at `http://localhost:3000` via `react-app-rewired` (see `config-overrides.js`). Note that the live Firebase project (`meta-rex`) referenced in `src/ml/firebase.ts` is the one used during the hackathon — point it at your own project if you plan to do anything serious.

## Status

Built during the [Zora Metabolism Hackathon](https://www.zora.co/) (Aug 4–10, 2022). Won the hackathon. Not actively maintained — kept here as a portfolio artifact and a snapshot of what was possible at the intersection of web3 music + in-browser ML in 2022.

The tipping contract was a work in progress at the deadline (`Tipping-wip.sol`) — supports ERC20 payments via a UUPS-upgradeable proxy with configurable commission, but was not deployed to mainnet.

## Credits

Built by [Brian Chitester](https://www.brianchitester.com) ([@brianchitester](https://github.com/brianchitester)), [Gal Shenar](https://github.com/gshenar), and [Christi Kaes](https://github.com/christikaes).

Thanks to the Zora team for running Metabolism, to Spinamp for making the underlying music data layer queryable, and to Nina, Catalog, and Sound.xyz for being the platforms that made onchain music worth recommending in the first place.
