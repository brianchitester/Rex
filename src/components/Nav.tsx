import React from "react";
import styled from "styled-components";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLocation, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";

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
      <NavItem onClick={() => navigate("/")}>Home</NavItem>
      <NavItem onClick={() => navigate("/trackList")}>All tracks</NavItem>
      {isConnected && (
        <NavItem onClick={() => navigate(`/myMusic/${address}`)}>
          My music
        </NavItem>
      )}
      <ConnectButton />
    </StyledNavContainer>
  );
}

const NavItem = styled.div`
  cursor: pointer;
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
`;

export default Nav;
