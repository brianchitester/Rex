import React from "react";
import styled from "styled-components";
import TrackList from "../components/TrackList";

function Home() {
  return (
    <StyledHomeContainer>
      <div>Welcome Home</div>
      <TrackList />
    </StyledHomeContainer>
  );
}

const StyledHomeContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export default Home;
