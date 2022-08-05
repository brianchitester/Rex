import React from "react";
import { useCollectionQuery } from "@spinamp/spinamp-hooks";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import Track from "../components/lib/Track";

function Owner() {
  const params = useParams();
  const navigate = useNavigate();
  const { collection, isLoading, isError } = useCollectionQuery(
    params?.ownerId ?? ""
  );

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
      <OwnerTitle>{`${params?.ownerId?.slice(0, 6)}'s collection`}</OwnerTitle>
      {collection.map((track) => {
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

export default Owner;
