import { ITrack } from "@spinamp/spinamp-hooks";
import React from "react";
import styled from "styled-components";
import { useCurrentTrack } from "../../context/CurrentTrackContext";

type TrackProps = {
  onClick: () => void;
  track: ITrack;
};
function Track({ onClick, track }: TrackProps) {
  const [currentTrack, setCurrentTrack] = useCurrentTrack();

  const selectTrack = () => {
    setCurrentTrack(track);
  };

  const isPlaying = currentTrack.id === track.id;

  return (
    <StyledTrackContainer
      background={track?.lossyArtworkUrl ?? ""}
      onClick={selectTrack}
      isPlaying={isPlaying}
    >
      <StyledTrackInfo onClick={onClick}>
        <div>{track.artist.name}</div>
        <div>-</div>
        <div>{track.title}</div>
      </StyledTrackInfo>
      <audio src={track?.lossyAudioUrl} />
    </StyledTrackContainer>
  );
}

const StyledTrackInfo = styled.div`
  display: flex;
  cursor: pointer;
  gap: 10px;
  padding: 5px;
  background-color: rgba(255, 255, 255, 0.6);
  font-weight: bold;
  border-radius: 5px;
  font-family: permanent-marker, sans-serif;
  font-weight: 400;
  font-style: normal;
`;

const StyledTrackContainer = styled.div<{
  background: string;
  isPlaying: boolean;
}>`
  display: flex;
  background-image: ${(props) => `url(${props.background})`};
  background-size: cover;
  border: ${(props) =>
    props.isPlaying ? "2px solid black" : "1px solid black"};
  gap: 10px;
  width: 100%;
  height: 72px;
  padding: 10px;
  align-items: center;
`;

export default Track;
