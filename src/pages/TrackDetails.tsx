import React from "react";
import { useTrackNftsOwnersQuery, useTrackQuery } from "@spinamp/spinamp-hooks";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import useWindowDimensions from "../hooks/useWindowDimensions";

function TrackDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const { width } = useWindowDimensions();
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

  const imageSize = width * 0.6;

  return (
    <StyledTrackDetailsContainer>
      <StyledTrackCover
        alt={track?.title}
        width={imageSize}
        height={imageSize}
        src={track?.lossyArtworkUrl}
      />
      <TrackTitle>{track?.title}</TrackTitle>
      <TrackArtist>{track?.artist.name}</TrackArtist>
      <TrackDescription>
        {track?.description?.replace(/<[^>]*>?/gm, "")}
      </TrackDescription>

      <audio controls src={track?.lossyAudioUrl}>
        Your browser does not support the
        <code>audio</code> element.
      </audio>
      {filteredOwners.length > 0 ? (
        <Owners>
          <h3>Owners</h3>
          {filteredOwners.map((owner) => (
            <OwnerLink key={owner} onClick={() => navigate(`/owner/${owner}`)}>
              {owner}
            </OwnerLink>
          ))}
        </Owners>
      ) : track?.platformId === "nina" ? (
        <Owners>{track.platformId} support coming soon!</Owners>
      ) : (
        <Owners>
          No owners,{" "}
          <BuyButton href={track?.websiteUrl}>be the first!</BuyButton>
        </Owners>
      )}
    </StyledTrackDetailsContainer>
  );
}

const StyledTrackDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledTrackCover = styled.img`
  padding: 20px;
`;

const BuyButton = styled.a`
  cursor: pointer;
`;

const TrackTitle = styled.h1`
  margin: 0px;
`;

const TrackArtist = styled.h2`
  margin: 0px;
`;

const TrackDescription = styled.div`
  margin: 1em;
`;

const Owners = styled.div`
  margin-top: 1em;
`;

const OwnerLink = styled.div`
  cursor: pointer;
  text-overflow: ellipsis;
  margin: 0.5em 0em;
`;

export default TrackDetails;
