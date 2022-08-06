import { gql, useQuery } from "@apollo/client";
import { ITrack } from "@spinamp/spinamp-sdk";
import { useLocation, useNavigate } from "react-router-dom";
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
    return <h2>Loading Recs</h2>;
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
    return <h2>Loading Recs</h2>;
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
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return <h2>Loading Recs</h2>;
  }

  if (error) {
    return (
      <div>
        <p>Ups! Something went wrong</p>
      </div>
    );
  }

  const recsArr = Object.keys(recs).map((key) => {
    const track =
      data.allProcessedTracks.edges.find((edge: any) => edge.node.id === key) ??
      ({} as ITrack);

    const trackWithArtist = {
      ...track.node,
      artist: { name: track.node.artistByArtistId.name ?? "" },
    };
    return {
      track: trackWithArtist,
      count: recs[key],
    };
  });

  // sort for most commonly owned
  recsArr.sort((a, b) => {
    return b.count - a.count;
  });

  console.log(recsArr);

  return (
    <div>
      {recsArr
        .filter(
          // filter out the current track
          (rec) =>
            rec.track.id !== location.pathname.replace("/trackDetails/", "")
        )
        .slice(0, 6)
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
  );
}

export default AllNfts;
