import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpinampProvider } from "@spinamp/spinamp-hooks";
import Home from "./pages/Home";
import TrackDetails from "./pages/TrackDetails";
import Owner from "./pages/Owner";
import TrackList from "./pages/TrackList";

function App() {
  return (
    <SpinampProvider>
      <BrowserRouter>
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
        </Routes>
      </BrowserRouter>
    </SpinampProvider>
  );
}

export default App;
