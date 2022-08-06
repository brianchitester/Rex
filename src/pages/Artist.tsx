import React from "react";
import { useAllTracksQuery } from "@spinamp/spinamp-hooks";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import Track from "../components/lib/Track";

function Artist() {
  const params = useParams();
  const navigate = useNavigate();
  const artist = `${params?.chainId + "/" ?? ""}${params?.artistId ?? ""}`;
  const { tracks, isLoading, isError } = useAllTracksQuery({
    filter: {
      artistId: { in: [artist] },
    },
  });

  if (isLoading) {
    return <p>Loading!</p>;
  }

  if (isError || tracks.length === 0) {
    return (
      <div>
        <p>Ups! Something went wrong</p>
      </div>
    );
  }

  return (
    <StyledOwnerContainer>
      <OwnerTitle>{`${tracks[0].artist.name}'s tracks`}</OwnerTitle>
      {tracks.map((track) => {
        return (
          <Track
            onClick={() => navigate(`/trackDetails/${track.id}`)}
            key={track.id}
            track={track}
          />
        );
      })}
    </StyledOwnerContainer>
  );
}

const StyledOwnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: permanent-marker, sans-serif;
  font-weight: 400;
  font-style: normal;
`;

const OwnerTitle = styled.h1`
  margin: 1em;
`;

export default Artist;
