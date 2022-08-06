import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { SpinampProvider } from "@spinamp/spinamp-hooks";
import Home from "./pages/Home";
import TrackDetails from "./pages/TrackDetails";
import Owner from "./pages/Owner";
import TrackList from "./pages/TrackList";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import Nav from "./components/Nav";
import { ApolloProvider } from "@apollo/client";
import { client } from "./apolloClient";
import { theme } from "./theme";
import { Player } from "./components/Player";
import { CurrentTrackProvider } from "./context/CurrentTrackContext";
import { Box, Container, ThemeProvider } from "@mui/material";

// TODO: replace with last played from local storage
const DEFAULT_TRACK = {
  id: "string",
  platformInternalId: "string",
  title: "string",
  slug: "string",
  platformId: "string",
  artistId: "string",
  artist: {
    id: "string",
    name: "string",
    createdAtTime: "string",
    slug: "string",
    profiles: {},
  },
  lossyAudioUrl: "string",
  // lossyArtworkUrl?: "string"
  // description?: string;
  // createdAtTime?: string;
  // websiteUrl?: string;
};

function App() {
  const { chains, provider } = configureChains(
    [chain.mainnet, chain.polygon],
    [
      alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_KEY }),
      publicProvider(),
    ]
  );

  const { connectors } = getDefaultWallets({
    appName: "Metabolism app", // todo, sweet name
    chains,
  });

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
  });

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <SpinampProvider>
          <ApolloProvider client={client}>
            <ThemeProvider theme={theme}>
              <HashRouter>
                <CurrentTrackProvider defaultTrack={DEFAULT_TRACK}>
                  <Nav />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/trackList" element={<TrackList />} />
                    <Route
                      path="/trackDetails/:chain/:token/:id"
                      element={<TrackDetails />}
                    />
                    <Route
                      path="/trackDetails/:chain/:token"
                      element={<TrackDetails />}
                    />
                    <Route path="/owner/:ownerId" element={<Owner />} />
                    <Route path="/myMusic/:ownerId" element={<Owner />} />
                  </Routes>
                  <Player />
                </CurrentTrackProvider>
              </HashRouter>
            </ThemeProvider>
          </ApolloProvider>
        </SpinampProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
