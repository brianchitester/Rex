import { ITrack } from "@spinamp/spinamp-hooks";
import React from "react";
import styled from "styled-components";

type TrackProps = {
  onClick: () => void;
  track: ITrack;
};
function Track({ onClick, track }: TrackProps) {
  return (
    <StyledTrackContainer background={track?.lossyArtworkUrl ?? ""}>
      <StyledTrackInfo onClick={onClick}>
        <div>{track?.artist?.name}</div>
        <div>-</div>
        <div>{track.title}</div>
      </StyledTrackInfo>
      <audio controls src={track?.lossyAudioUrl} />
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

const StyledTrackContainer = styled.div<{ background: string }>`
  display: flex;
  background-image: ${(props) => `url(${props.background})`};
  background-size: cover;
  border: 1px solid black;
  gap: 10px;
  width: 100%;
  height: 72px;
  padding: 10px;
  align-items: center;
`;

export default Track;
