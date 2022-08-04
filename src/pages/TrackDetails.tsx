import React from "react";
import { useTrackNftsOwnersQuery, useTrackQuery } from "@spinamp/spinamp-hooks";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

function TrackDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const trackId = `${params?.chain ?? ""}/${params?.token ?? ""}${
    params.id ? `/${params.id}` : ""
  }`;
  const { track, isLoading, isError } = useTrackQuery(trackId);
  const {
    owners,
    isLoading: isOwnerLoading,
    isError: isOwnerError,
  } = useTrackNftsOwnersQuery(trackId ?? "");
  if (isLoading || isOwnerLoading) {
    return <p>Loading!</p>;
  }

  if (isError || isOwnerError) {
    return (
      <div>
        <p>Ups! Something went wrong</p>
      </div>
    );
  }

  const filteredOwners = owners.filter((owner) => !!owner);

  return (
    <StyledTrackDetailsContainer>
      <div>
        <div>Welcome TrackDetails</div>
        <div>{track?.title}</div>
        <div>{track?.artist.name}</div>
        <div>{track?.description}</div>
        <img width={150} height={150} src={track?.lossyArtworkUrl} />
        <audio controls src={track?.lossyAudioUrl}>
          Your browser does not support the
          <code>audio</code> element.
        </audio>
        {filteredOwners.length > 0 ? (
          <>
            <div>Owners</div>
            <ul>
              {filteredOwners.map((owner) => (
                <li key={owner} onClick={() => navigate(`/owner/${owner}`)}>
                  {owner}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div>No owners, be the first!</div>
        )}
      </div>
    </StyledTrackDetailsContainer>
  );
}

const StyledTrackDetailsContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export default TrackDetails;
