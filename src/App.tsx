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
import Artist from "./pages/Artist";

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
            <HashRouter>
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
                <Route
                  path="/artist/:chainId/:artistId/:artistName"
                  element={<Artist />}
                />
              </Routes>
            </HashRouter>
          </ApolloProvider>
        </SpinampProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
