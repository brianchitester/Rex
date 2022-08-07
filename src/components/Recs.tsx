import { gql, useQuery } from "@apollo/client";
import { ITrack } from "@spinamp/spinamp-sdk";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Track from "./lib/Track";

type AllNftsProps = {
  owners: string[];
};

// HACK: queries break if we pass too many ids to filter by
const MAX_QUERY_ENTITIES = 1100;

function AllNfts({ owners }: AllNftsProps) {
  //try slicing owners
  const ownersString = `["${owners.slice(0, MAX_QUERY_ENTITIES).join('","')}"]`;
  const ALL_NFTS_QUERY = gql`
  query AllNftsQuery {
    allNfts(filter: {owner: {in: ${ownersString}}}) {
      edges {
        node {
          id
          platformId
          createdAtTime
        }
      }
    }
  }
  `;
  const { data, loading, error } = useQuery(ALL_NFTS_QUERY);

  if (loading) {
    return <h2>Loading Rex</h2>;
  }

  if (error) {
    return (
      <div>
        <p>Ups! Something went wrong</p>
      </div>
    );
  }

  return (
    <RecTracks ids={data.allNfts.edges.map((edge: any) => edge.node.id)} />
  );
}

type RecTracksProps = {
  ids: string[];
};

function RecTracks({ ids }: RecTracksProps) {
  // owners can have multiple of the same track...
  const idsString = `["${ids.slice(0, MAX_QUERY_ENTITIES).join('","')}"]`;
  const ALL_NFTS_QUERY = gql`
    query AllNftsProcessedTracks {
        allNftsProcessedTracks(filter: {nftId: {in: ${idsString}}}) {
        edges {
          node {
            processedTrackId
          }
        }
      }
    }
    `;
  const { data, loading, error } = useQuery(ALL_NFTS_QUERY);

  if (loading) {
    return <h2>Loading Rex</h2>;
  }

  if (error) {
    return (
      <div>
        <p>Ups! Something went wrong</p>
      </div>
    );
  }

  // now that we have the owner [] tracks []
  // reduce to the most commonly owned tracks
  const recsObj = data.allNftsProcessedTracks.edges.reduce(
    (accum: { [key: string]: number }, edge: any) => {
      if (!edge.node.processedTrackId) {
      } else if (!accum[edge.node.processedTrackId]) {
        accum[edge.node.processedTrackId] = 1;
      } else {
        accum[edge.node.processedTrackId] =
          accum[edge.node.processedTrackId] + 1;
      }
      return accum;
    },
    {}
  );

  return <Recs recs={recsObj} />;
}

type RecsProps = {
  recs: { [key: string]: number };
};

function Recs({ recs }: RecsProps) {
  const idsString = `["${Object.keys(recs).join('","')}"]`;
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

  if (loading) {
    return <h2>Loading Rex</h2>;
  }

  if (error) {
    return (
      <div>
        <p>Ups! Something went wrong</p>
      </div>
    );
  }

  return (
    <Final
      processedTracks={data.allProcessedTracks.edges.map(
        (edge: any) => edge.node
      )}
      recsCounts={recs}
    />
  );
}

type FinalProps = {
  processedTracks: { [key: string]: any };
  recsCounts: any;
};

function Final({ processedTracks, recsCounts }: FinalProps) {
  const idsString = `["${processedTracks
    .map((rec: any) => rec.id)
    .join('","')}"]`;
  const ALL_TRACKS_QUERY = gql`
    query MyQuery {
      allProcessedTracks (
        filter: {id: {in: ${idsString}}}
      ) {
        nodes {
          nftsProcessedTracksByProcessedTrackId {
            totalCount
          }
          id
        }
      }
    }
  `;

  const { data, loading, error } = useQuery(ALL_TRACKS_QUERY);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return <h2>Loading Rex</h2>;
  }

  if (error) {
    return (
      <div>
        <p>Ups! Something went wrong</p>
      </div>
    );
  }

  const recsArr = Object.keys(recsCounts).map((key) => {
    const track =
      processedTracks.find((edge: any) => edge.id === key) ?? ({} as ITrack);

    const trackWithArtist = {
      ...track,
      artist: { name: track.artistByArtistId.name ?? "" },
    };
    const totalSupply =
      data.allProcessedTracks.nodes.find((node: any) => node.id === key)
        .nftsProcessedTracksByProcessedTrackId.totalCount ?? 1;
    return {
      totalSupply,
      track: trackWithArtist,
      count: recsCounts[key],
    };
  });

  const normalizedRecs = recsArr.map((rec) => {
    return {
      totalSupply: rec.totalSupply,
      track: rec.track,
      count: rec.count / rec.totalSupply,
    };
  });

  // sort for most commonly owned
  recsArr.sort((a, b) => {
    return b.count - a.count;
  });

  normalizedRecs.sort((a, b) => {
    return b.count - a.count;
  });

  return (
    <>
      {normalizedRecs.length > 1 && (
        <RexCol>
          <h3>Owner Rex Normalized</h3>
          <div>
            {normalizedRecs
              .filter(
                // filter out the current track
                (rec) =>
                  rec.track.id !==
                  location.pathname.replace("/trackDetails/", "")
              )
              .slice(0, 5)
              .map((rec) => {
                return (
                  <Track
                    onClick={() => navigate(`/trackDetails/${rec.track.id}`)}
                    key={rec.track.id}
                    track={rec.track} // some info is missing here
                  />
                );
              })}
          </div>
        </RexCol>
      )}
      {recsArr.length > 1 && (
        <RexCol>
          <h3>Owner Rex Raw</h3>
          <div>
            {recsArr
              .filter(
                // filter out the current track
                (rec) =>
                  rec.track.id !==
                  location.pathname.replace("/trackDetails/", "")
              )
              .slice(0, 5)
              .map((rec) => {
                return (
                  <Track
                    onClick={() => navigate(`/trackDetails/${rec.track.id}`)}
                    key={rec.track.id}
                    track={rec.track} // some info is missing here
                  />
                );
              })}
          </div>
        </RexCol>
      )}
    </>
  );
}

const RexCol = styled.div`
  width: 30vw;
  min-width: 300px;
`;

export default AllNfts;
