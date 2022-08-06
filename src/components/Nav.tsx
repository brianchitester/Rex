import React from "react";
import styled from "styled-components";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLocation, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import ArtistSearch from "./ArtistSearch";

function Nav() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const location = useLocation();

  // dont render on the homepage
  if (location.pathname === "/") {
    return null;
  }
  return (
    <StyledNavContainer>
      <NavTitle onClick={() => navigate("/")}>Rex</NavTitle>
      <Spacer />
      <NavItem
        location={location.pathname}
        path="/trackList"
        onClick={() => navigate("/trackList")}
      >
        All
      </NavItem>
      <NavItem
        location={location.pathname}
        path="/platform/catalog"
        onClick={() => navigate("/platform/catalog")}
      >
        catalog
      </NavItem>
      <NavItem
        location={location.pathname}
        path="/platform/sound"
        onClick={() => navigate("/platform/sound")}
      >
        sound
      </NavItem>
      <NavItem
        location={location.pathname}
        path="/platform/nina"
        onClick={() => navigate("/platform/nina")}
      >
        nina
      </NavItem>
      <NavItem
        location={location.pathname}
        path="/platform/noizd"
        onClick={() => navigate("/platform/noizd")}
      >
        noizd
      </NavItem>
      <NavItem
        location={location.pathname}
        path="/platform/mintsongs"
        onClick={() => navigate("/platform/mintsongs")}
      >
        mintsongs
      </NavItem>
      <ArtistSearch />
      {isConnected && (
        <NavItem
          location={location.pathname}
          path="/myMusic"
          onClick={() => navigate(`/myMusic/${address}`)}
        >
          My music
        </NavItem>
      )}
      <ConnectButton />
    </StyledNavContainer>
  );
}

const Spacer = styled.div`
  flex-grow: 1;
`;

const NavTitle = styled.div`
  font-size: 2em;
  cursor: pointer;
`;

const NavItem = styled.div<{ path: string; location: string }>`
  cursor: pointer;
  text-decoration: ${(props) =>
    props.location.includes(props.path) ? "underline" : ""};
`;

const StyledNavContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 3em;
  padding: 1em;
  font-family: permanent-marker, sans-serif;
  font-weight: 400;
  font-style: normal;
  border-bottom: 1px solid black;
`;

export default Nav;
