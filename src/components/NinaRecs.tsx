import { useEffect, useState } from "react";
import styled from "styled-components";
import Track from "./lib/Track";
import { gql, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";

type NinaTracksProps = {
  trackIds: string[];
};

function NinaTracks({ trackIds }: NinaTracksProps) {
  const idsString = `["${trackIds.join('","')}"]`;
  const ALL_TRACKS_QUERY = gql`
  query AllTracksQuery {
      allProcessedTracks(
        filter: {id: {in: ${idsString}}}
      ) {
        edges {
          node {
              id
              platformInternalId
              title
              slug
              platformId
              artistId
              artistByArtistId {
                name
              }
              lossyAudioUrl
              lossyArtworkUrl
              description
              createdAtTime
              websiteUrl
          }
        }
      }
    }
    `;

  const { data, loading, error } = useQuery(ALL_TRACKS_QUERY);
  const navigate = useNavigate();

  if (loading) {
    return (
      <RexCol>
        <h3>Loading Rex</h3>
      </RexCol>
    );
  }

  if (error) {
    return (
      <div>
        <p>Ups! Something went wrong</p>
      </div>
    );
  }

  const processedData = data.allProcessedTracks.edges.map((edge: any) => {
    return {
      ...edge.node,
      artist: { name: edge?.node?.artistByArtistId?.name ?? "" },
    };
  });

  return (
    <>
      {processedData.map((track: any) => {
        return (
          <Track
            onClick={() => navigate(`/trackDetails/${track.id}`)}
            key={track.id}
            track={track}
          />
        );
      })}
    </>
  );
}

type NinaRecsProps = {
  trackId: string;
};

function NinaRecs({ trackId }: NinaRecsProps) {
  const [owners, setOwners] = useState<string[]>();
  const [ninaRecs, setNinaRecs] = useState<string[]>();
  const fetchOwners = async (trackId: string) => {
    const resp = await fetch(
      `https://api.ninaprotocol.com/v1/releases/${trackId}/collectors`
    );
    const owners = await resp.json();
    if (!owners?.collectors) {
      console.error("something broke");
      return;
    }
    setOwners(owners?.collectors.map((collector: any) => collector.publicKey));
    const ownerCollections = await Promise.all(
      // hack, limit collectors to try to minimize rate limiting
      owners?.collectors.slice(0, 50).map((collector: any) => {
        return fetchOwnersTracks(collector.publicKey);
      })
    );
    const flowOwnerCollections = ownerCollections.flat();

    const recsCounts = flowOwnerCollections.reduce(
      (accum: { [key: string]: number }, edge: any) => {
        if (!edge.mint) {
          console.log("no mint");
          console.log(edge);
        } else if (!accum[edge.mint]) {
          accum[edge.mint] = 1;
        } else {
          accum[edge.mint] = accum[edge.mint] + 1;
        }
        return accum;
      },
      {}
    );

    const recsArr = Object.keys(recsCounts).map((key) => {
      return {
        trackId: `solana/${key}`,
        count: recsCounts[key],
      };
    });

    recsArr.sort((a, b) => {
      return b.count - a.count;
    });

    console.log(recsArr);
    setNinaRecs(recsArr.slice(1, 8).map((rec) => rec.trackId));
  };

  const fetchOwnersTracks = async (ownerId: string) => {
    const resp = await fetch(
      `https://api.ninaprotocol.com/v1/accounts/${ownerId}/collected`
    );
    const ownersTracks = await resp.json();
    if (!ownersTracks?.collected) {
      console.error("something broke");
      return;
    }
    return ownersTracks.collected;
  };

  useEffect(() => {
    fetchOwners(trackId);
  }, [trackId, fetchOwners]);

  return (
    <RexCol>
      {ninaRecs && ninaRecs.length > 1 && (
        <>
          <h3>Owner Rex</h3>
          <div>
            <NinaTracks trackIds={ninaRecs} />
          </div>
        </>
      )}
      <h3>Owners</h3>
      <ul>
        {owners &&
          owners?.map((owner) => {
            return <li>{owner}</li>;
          })}
      </ul>
    </RexCol>
  );
}

const RexCol = styled.div`
  width: 30vw;
  min-width: 300px;
  > h3 {
    font-weight: 200;
    font-size: 1.8em;
    font-family: permanent-marker, sans-serif;
  }
`;

export default NinaRecs;
