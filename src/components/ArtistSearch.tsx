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

  const uniqueArtistNames = [...new Set(artists.map((artist) => artist.name))];

  const artistOptions = uniqueArtistNames.map((artistName) => {
    return {
      label: artistName,
      id: artists.find(
        (artist) => artist.name === artistName && artist.id.includes("/")
      )?.id,
    };
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
            const artistSelected = artistOptions.find(
              (artist) => artist.label === inputValue
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
