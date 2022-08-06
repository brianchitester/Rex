import React from "react";
import { usePaginatedTracksQuery } from "@spinamp/spinamp-hooks";
import { useNavigate, useParams } from "react-router-dom";
import Track from "../components/lib/Track";
import styled from "styled-components";

function PlatformTracks() {
  const params = useParams();
  const { tracks, isLoading, isError } = usePaginatedTracksQuery(50, {
    filter: {
      platformId: { in: [params?.platformId ?? ""] },
    },
  });
  const navigate = useNavigate();
  if (isLoading) {
    return <p>Loading</p>;
  }

  if (isError) {
    return (
      <div>
        <p>Ups! Something went wrong</p>
      </div>
    );
  }

  return (
    <div>
      <TrackListTitle>{params?.platformId}</TrackListTitle>
      <div>
        {tracks.map((track) => (
          <Track
            onClick={() => navigate(`/trackDetails/${track.id}`)}
            key={track.id}
            track={track}
          />
        ))}
      </div>
    </div>
  );
}

const TrackListTitle = styled.h1`
  font-family: permanent-marker, sans-serif;
  font-weight: 400;
  font-style: normal;
  margin: 1em;
`;

export default PlatformTracks;
