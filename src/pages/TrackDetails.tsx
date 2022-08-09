import React, { useEffect, useState } from "react";
import {
  fetchTrackById,
  useTrackNftsOwnersQuery,
  useTrackQuery,
} from "@spinamp/spinamp-hooks";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import useWindowDimensions from "../hooks/useWindowDimensions";
import AllNfts from "../components/Recs";
import { useNFT as useZoraNFT } from "@zoralabs/nft-hooks";
import { useCurrentTrack } from "../context/CurrentTrackContext";
import { getTrackClasisfications } from "../ml/firebase";
import { Chip, Box, Button } from "@mui/material";
import { getTrackRecommendations } from "../ml";
import Track from "../components/lib/Track";

function TrackDetails() {
  const [showMoreOwners, setShowMoreOwners] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  // this might be dumb, causing a lot of rerenders
  const { width, height } = useWindowDimensions();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentTrack, setCurrentTrack] = useCurrentTrack();

  const trackId = `${params?.chain ?? ""}/${params?.token ?? ""}${
    params.id ? `/${params.id}` : ""
  }`;
  const { track, isLoading, isError } = useTrackQuery(trackId);
  const {
    owners,
    isLoading: isOwnerLoading,
    isError: isOwnerError,
  } = useTrackNftsOwnersQuery(trackId ?? "");

  const { data: zoraData } = useZoraNFT(params?.token, params.id);

  let zoraPrice = 0 as number | undefined;
  let zoraPriceSymbol = "" as string | undefined;
  if (zoraData?.markets?.length) {
    zoraPrice = zoraData.markets[0].amount?.amount.value;
    zoraPriceSymbol = zoraData.markets[0].amount?.symbol;
  }

  useEffect(() => {
    if (track) {
      setCurrentTrack(track);
    }
  }, [track, setCurrentTrack]);

  const [classifications, setClassifications] = useState<any>();
  const [mlRex, setMlRex] = useState<any>();
  useEffect(() => {
    (async () => {
      const c: any = await getTrackClasisfications(trackId);
      setClassifications({
        emotion: Object.keys(c.emotion).sort(
          (a, b) => c.emotion[b] - c.emotion[a]
        )[0],
        genre: Object.keys(c.genre).sort((a, b) => c.genre[b] - c.genre[a])[0],
        type: Object.keys(c.type).sort((a, b) => c.type[b] - c.type[a])[0],
      });

      const rex = await getTrackRecommendations(trackId);

      const trackRex = await Promise.all(
        rex.map(async (r) => await fetchTrackById(r[1]))
      );
      console.log(trackRex);
      setMlRex(trackRex);
    })();
  }, [trackId]);

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

  return (
    <StyledTrackDetailsContainer>
      <StyledTrackCover
        alt={track?.title}
        width={imageSize}
        height={imageSize}
        src={track?.lossyArtworkUrl}
      />
      <TrackTitle>{track?.title} </TrackTitle>
      <TrackArtist onClick={() => navigate(`/artist/${track?.artist.id}`)}>
        {track?.artist.name}
      </TrackArtist>
      <TrackDescription width={imageSize}>
        {classifications && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Chip
              color="primary"
              variant="outlined"
              label={classifications.genre}
              sx={{ margin: 0.5 }}
            />
            <Chip
              color="primary"
              variant="outlined"
              label={classifications.emotion}
              sx={{ margin: 0.5 }}
            />
          </Box>
        )}
        {track?.description?.replace(/<[^>]*>?/gm, "")}
      </TrackDescription>

      {track?.websiteUrl && track?.platformId && (
        <Button variant="contained" href={track?.websiteUrl}>
          view on{" "}
          {track.platformId
            .replace(
              "0x8427e46826a520b1264b55f31fcb5ddfdc31e349",
              "chaos.build"
            )
            .replace(
              "0x719C6d392fc659f4fe9b0576cBC46E18939687a7",
              "danielallan.xyz"
            )}
        </Button>
      )}

      <TrackTitle>
        {zoraPrice ? (
          <>
            <TrackPrice>Zora Market Price: </TrackPrice>
            <TrackPrice>{zoraPrice}</TrackPrice>{" "}
            <TrackPriceSymbol>{zoraPriceSymbol}</TrackPriceSymbol>
          </>
        ) : null}
      </TrackTitle>
      <RexContainer>
        {mlRex && mlRex.length > 0 && (
          <RexCol>
            <h3>Content based Rex</h3>
            <div>
              {mlRex.map((track: any) => {
                return (
                  <Track
                    onClick={() => navigate(`/trackDetails/${track.id}`)}
                    key={track.id}
                    track={track}
                  />
                );
              })}
            </div>
          </RexCol>
        )}
        {filteredOwners.length > 0 && <AllNfts owners={filteredOwners} />}
      </RexContainer>
      {filteredOwners.length > 0 ? (
        <Owners>
          <h3>Owners</h3>
          {!!showMoreOwners && (
            <OwnerLink onClick={() => setShowMoreOwners(false)}>
              ... Show less
            </OwnerLink>
          )}
          {showMoreOwners ? (
            filteredOwners.map((owner) => (
              <OwnerLink
                key={owner}
                onClick={() => navigate(`/owner/${owner}`)}
              >
                {owner}
              </OwnerLink>
            ))
          ) : (
            <>
              {filteredOwners.slice(0, 5).map((owner) => (
                <OwnerLink
                  key={owner}
                  onClick={() => navigate(`/owner/${owner}`)}
                >
                  {owner}
                </OwnerLink>
              ))}
              {filteredOwners.length > 5 && (
                <OwnerLink onClick={() => setShowMoreOwners(true)}>
                  ... Show {filteredOwners.length - 4} more
                </OwnerLink>
              )}
            </>
          )}
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

const RexContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
`;

const RexCol = styled.div`
  width: 30vw;
  min-width: 300px;
`;

const StyledTrackDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 200px;
  background-color: cornsilk;
`;

const StyledTrackCover = styled.img`
  margin: 30px;
  margin-top: 50px;
  box-shadow: 0 0 10px 10px rgba(0, 0, 0, 0.2);
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
  cursor: pointer;
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

const TrackPrice = styled.span`
  margin-top: 1em;
  font-weight: 200;
  font-size: 0.7em;
  font-family: permanent-marker, sans-serif;
`;

const TrackPriceSymbol = styled.span`
  margin-top: 1em;
  font-weight: 200;
  font-size: 0.5em;
  font-family: permanent-marker, sans-serif;
`;

export default TrackDetails;
