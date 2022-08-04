import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpinampProvider } from "@spinamp/spinamp-hooks";
import Home from "./pages/Home";
import TrackDetails from "./pages/TrackDetails";

function App() {
  return (
    <SpinampProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/trackDetails/:chain/:token/:id"
            element={<TrackDetails />}
          />
          <Route
            path="/trackDetails/:chain/:token"
            element={<TrackDetails />}
          />
        </Routes>
      </BrowserRouter>
    </SpinampProvider>
  );
}

export default App;
