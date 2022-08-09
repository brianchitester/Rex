import React, { useEffect, useState } from "react";
import { fetchTrackById, useCollectionQuery } from "@spinamp/spinamp-hooks";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import Track from "../components/lib/Track";
import { getFavorites } from "../ml/firebase";
import { useAccount } from "wagmi";

function Owner() {
  const params = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { collection, isLoading, isError } = useCollectionQuery(
    params?.ownerId ?? ""
  );

  const [favorites, setFavorites] = useState<any>();
  useEffect(() => {
    (async () => {
      if (!params?.ownerId) {
        return;
      }
      const favIds = await getFavorites(params?.ownerId);
      const favs = await Promise.all(
        favIds.map(async (r: any) => await fetchTrackById(r))
      );
      setFavorites(favs);
    })();
  }, [params]);

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
    <StyledOwnerContainer>
      <OwnerTitle>
        {address === params?.ownerId
          ? "My Music"
          : `${params?.ownerId?.slice(0, 6)}'s collection`}
      </OwnerTitle>
      {collection.map((track) => {
        return (
          <Track
            onClick={() => navigate(`/trackDetails/${track.id}`)}
            key={track.id}
            track={track}
          />
        );
      })}
      {address === params?.ownerId && favorites && (
        <>
          <OwnerTitle>My Favorites</OwnerTitle>
          {favorites.map((track: any) => {
            return (
              <Track
                onClick={() => navigate(`/trackDetails/${track.id}`)}
                key={track.id}
                track={track}
              />
            );
          })}
        </>
      )}
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

export default Owner;
