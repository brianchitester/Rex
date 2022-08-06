import React from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, TextField } from "@mui/material";
import { useAllArtistsQuery } from "@spinamp/spinamp-hooks";

function ArtistSearch() {
  const navigate = useNavigate();
  const { artists, isLoading, isError } = useAllArtistsQuery();
  if (isLoading) {
    return <p>Loading</p>;
  }

  if (isError) {
    return (
      <div>
        <p>Ups! Something went wrong</p>
      </div>
    );
  }

  const artistOptions = artists.map((artist) => {
    return { label: artist.name, id: artist.id };
  });

  return (
    <div>
      <Autocomplete
        autoComplete
        disablePortal
        options={artistOptions}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Artist" />}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            console.log(e.target.getAttribute("value"));
            const inputValue = e.target.getAttribute("value") ?? "";
            const artistSelected = artists.find(
              (artist) => artist.name === inputValue
            );
            if (artistSelected) {
              navigate(`/artist/${artistSelected?.id}`);
            }
          }
        }}
      />
    </div>
  );
}

export default ArtistSearch;
