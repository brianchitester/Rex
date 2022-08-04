import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

function Home() {
  const navigate = useNavigate();
  return (
    <StyledHomeContainer>
      <h1>Welcome Home</h1>
      <button onClick={() => navigate("/trackList")}>go to track list</button>
    </StyledHomeContainer>
  );
}

const StyledHomeContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export default Home;
