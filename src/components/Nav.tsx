import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function Nav() {
  // const navigate = useNavigate();
  return (
    <StyledNavContainer>
      <ConnectButton />
    </StyledNavContainer>
  );
}

const StyledNavContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 1em;
  padding: 1em;
`;

export default Nav;
