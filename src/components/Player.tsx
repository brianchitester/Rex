import { styled } from "@mui/material";
import { useCurrentTrack } from "../context/CurrentTrackContext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

export const Player = () => {
  const [currentTrack, _] = useCurrentTrack();

  return (
    <StyledPlayerContainer>
      Player
      {JSON.stringify(currentTrack)}
      <PlayArrowIcon />
    </StyledPlayerContainer>
  );
};

const StyledPlayerContainer = styled("div")(
  ({ theme }) => `
  position: fixed;
  z-index: 1;
  bottom: 0;
  left: 0;
  height: 50px;
  width: 100%;
  background-color: ${theme.palette.background.default};
`
);
