import React from "react";
import { usePaginatedTracksQuery } from "@spinamp/spinamp-hooks";
import { useNavigate } from "react-router-dom";
import Track from "../components/lib/Track";

function TrackList() {
  const { tracks, isLoading, isError } = usePaginatedTracksQuery(50);
  const navigate = useNavigate();
  if (isLoading) {
    return <p>Loading!</p>;
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
      <p>All tracks list!</p>
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

export default TrackList;
