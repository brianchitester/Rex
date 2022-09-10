import React from "react";
import { useAllTracksQuery } from "@spinamp/spinamp-hooks";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import Track from "../components/lib/Track";
import { gql, useQuery } from "@apollo/client";

function Artist() {
  const params = useParams();
  const navigate = useNavigate();
  const artist = `${params?.chainId ? params?.chainId + "/" : ""}${
    params?.artistId ?? ""
  }`;

  const ALL_TRACKS_QUERY = gql`
  query AllTracksQuery {
    allArtists(
        filter: {id: {in: "${artist}"}}
      ) {
        edges {
          node {
              id
              name
              processedTracksByArtistId {
                nodes {
                  id
                  platformInternalId
                  title
                  slug
                  platformId
                  lossyAudioUrl
                  lossyArtworkUrl
                  description
                  createdAtTime
                  websiteUrl
                }
              }
          }
        }
      }
    }
    `;

  const { data, loading, error } = useQuery(ALL_TRACKS_QUERY);

  if (loading) {
    return <p>Loading!</p>;
  }

  if (error || data.length === 0) {
    return (
      <div>
        <p>Ups! Something went wrong</p>
      </div>
    );
  }

  console.log(data);

  const processedData =
    data?.allArtists?.edges[0]?.node?.processedTracksByArtistId?.nodes?.map(
      (edge: any) => {
        return {
          ...edge,
          artist: { name: data.allArtists.edges[0].node.name ?? "" },
        };
      }
    );

  return (
    <StyledOwnerContainer>
      <OwnerTitle>{`${processedData[0].artist.name}'s tracks`}</OwnerTitle>
      {processedData.map((track: any) => {
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
