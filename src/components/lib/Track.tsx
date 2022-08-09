import { ITrack } from "@spinamp/spinamp-hooks";
import React from "react";
import styled from "styled-components";
import { useCurrentTrack } from "../../context/CurrentTrackContext";

type TrackProps = {
  onClick: () => void;
  track: ITrack;
  expanded?: boolean;
};
function Track({ onClick, track, expanded }: TrackProps) {
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
      style={{
        transform: expanded
          ? "skew(-10deg, -.5deg) scale(1.6) translateY(-15%)"
          : "",
        filter: expanded ? "" : "brightness(75%)",
        zIndex: expanded ? 2 : 1,
      }}
    >
      <StyledTrackInfo onClick={onClick}>
        <div>{track?.artist?.name}</div>
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
  padding: 5px 10px;
  background-color: rgba(255, 255, 255, 0.7);
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
  justify-content: center;
  background-image: ${(props) =>
    `url(${props.background.replace("(", `\\(`).replace(")", "\\)")})`};
  background-color: #92929267;
  background-size: cover;
  border: ${(props) =>
    props.isPlaying ? "2px solid black" : "1px solid black"};
  gap: 10px;
  width: 100%;
  height: 60px;
  padding: 10px;
  align-items: center;
  transition: transform 0.2s;
`;

export default Track;
