import React from "react";
import { useCollectionQuery } from "@spinamp/spinamp-hooks";
import { useParams } from "react-router-dom";
import styled from "styled-components";

function Owner() {
  const params = useParams();
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
      {collection.map((track) => {
        return (
          <div>
            <div>{track.artist.name}</div>
            <div>{track.title}</div>
          </div>
        );
      })}
    </StyledOwnerContainer>
  );
}

const StyledOwnerContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export default Owner;
