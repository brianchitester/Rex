import React, { useState } from "react";
import { useTrackNftsOwnersQuery, useTrackQuery } from "@spinamp/spinamp-hooks";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import {
  fetchCollectionForAddress,
  fetchTrackById,
  ITrack,
} from "@spinamp/spinamp-sdk";
import useWindowDimensions from "../hooks/useWindowDimensions";
import Track from "../components/lib/Track";

function TrackDetails() {
  const [recs, setRecs] = useState<{ track: ITrack; count: number }[]>([]);
  const [calledOnce, setCalledOnce] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const { width, height } = useWindowDimensions();
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

  const imageSize = height < width ? height * 0.6 : width * 0.6;

  // madness ahead
  const getRecs = async () => {
    // array of arrays
    const ownertracks = await Promise.all(
      filteredOwners.map(async (owner) => {
        // this is going to get called a lot for certain tracks
        const ownerCollection = await fetchCollectionForAddress(owner);
        const tracks = ownerCollection.map((track) => track.id);
        return tracks;
      })
    );

    const recsObj = ownertracks.reduce(
      (accum: { [key: string]: number }, tracks) => {
        tracks.forEach((track) => {
          if (!accum[track]) {
            accum[track] = 1;
          } else {
            accum[track] = accum[track] + 1;
          }
        });
        return accum;
      },
      {}
    );
    const recsArr = await Promise.all(
      Object.keys(recsObj).map(async (key) => {
        const track = await fetchTrackById(key);
        return {
          track: track ?? ({} as ITrack),
          count: recsObj[key],
        };
      })
    );
    recsArr.sort((a, b) => {
      return b.count - a.count;
    });
    setCalledOnce(true);
    setRecs(recsArr.slice(1, 5)); // first rec will be the same track
  };

  if (!calledOnce) {
    getRecs();
  }

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
      <TrackDescription width={imageSize}>
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
      {recs.length > 0 && (
        <>
          <div>Similar taste</div>
          {recs.map((rec) => {
            return (
              <Track
                onClick={() => navigate(`/trackDetails/${rec.track.id}`)}
                key={rec.track.id}
                track={rec.track}
              />
            );
          })}
        </>
      )}
    </StyledTrackDetailsContainer>
  );
}

const StyledTrackDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2em;
`;

const StyledTrackCover = styled.img`
  padding: 20px;
`;

const BuyButton = styled.a`
  cursor: pointer;
`;

const TrackTitle = styled.h1`
  margin: 0px;
  font-family: permanent-marker, sans-serif;
  font-weight: 400;
  font-style: normal;
`;

const TrackArtist = styled.h2`
  margin: 0px;
  font-family: permanent-marker, sans-serif;
  font-weight: 400;
  font-style: normal;
`;

const TrackDescription = styled.div<{ width: number }>`
  margin: 1em;
  width: ${(props) => `${props.width}px;`};
  text-align: center;
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
