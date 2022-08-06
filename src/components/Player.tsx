import { Box, IconButton, Slider, styled, useTheme } from "@mui/material";
import { useCurrentTrack } from "../context/CurrentTrackContext";
import {
  PlayCircleRounded,
  PauseCircleRounded,
  SkipNextRounded,
  SkipPreviousRounded,
  FavoriteRounded,
} from "@mui/icons-material";
import {
  AudioPlayerProvider,
  useAudioPlayerControls,
  useAudioPlayerSeek,
} from "../context/AudioPlayerContext";
import { useLocation } from "react-router-dom";

const Seek = () => {
  const { seek, seekTo, duration } = useAudioPlayerSeek();

  return (
    <Slider
      size="small"
      value={seek}
      min={0}
      max={duration}
      onChange={(_, value) => seekTo(value as number)}
      sx={{
        height: 4,
        "& .MuiSlider-thumb": {
          width: 8,
          height: 8,
          transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
          "&:before": {
            boxShadow: "0 2px 12px 0 rgba(0,0,0,0.4)",
          },
          "&:hover, &.Mui-focusVisible": {
            boxShadow: `0px 0px 0px 8px ${"rgb(0 0 0 / 16%)"}`,
          },
          "&.Mui-active": {
            width: 20,
            height: 20,
          },
        },
        "& .MuiSlider-rail": {
          opacity: 0.28,
        },
      }}
    />
  );
};

const Controls = () => {
  const { playing, togglePlayPause } = useAudioPlayerControls();

  return (
    <IconButton onClick={togglePlayPause}>
      {playing ? (
        <PauseCircleRounded fontSize="large" />
      ) : (
        <PlayCircleRounded fontSize="large" />
      )}
    </IconButton>
  );
};

const CD = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentTrack, _] = useCurrentTrack();
  const { playing } = useAudioPlayerControls();
  const { seek } = useAudioPlayerSeek();

  const theme = useTheme();

  console.log("seek", seek);
  console.log("seek2", seek % 360);
  console.log("seek1000", (seek * 1000) % 360);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: "50%",
        overflow: "hidden",
        height: 100,
        width: 100,
        transform: `rotate(${(seek * 20) % 360}deg)`,
        animation: playing ? "rotate 10s linear infinite" : "none",
      }}
    >
      <img
        alt="cover"
        src={currentTrack?.lossyArtworkUrl}
        style={{
          objectFit: "cover",
          width: "100%",
          height: "100%",
        }}
      />
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          width: "20%",
          height: "20%",
          borderRadius: "50%",
          position: "absolute",
          top: "40%",
          left: "40%",
          zIndex: 1,
        }}
      ></Box>
    </Box>
  );
};

export const Player = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentTrack, _] = useCurrentTrack();
  const location = useLocation();

  // dont render on the homepage (or if not set TODO)
  if (location.pathname === "/" || currentTrack.title === "string") {
    return null;
  }

  return (
    <AudioPlayerProvider>
      <StyledPlayerContainer>
        <Box
          sx={{
            display: "flex",
            width: "100%",
          }}
        >
          <Box
            sx={{
              margin: 2,
            }}
          >
            <CD />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
            }}
          >
            {`${currentTrack?.title}-${currentTrack?.artist.name}`}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconButton>
                <SkipPreviousRounded fontSize="medium" />
              </IconButton>
              <Controls />
              <IconButton>
                <SkipNextRounded fontSize="medium" />
              </IconButton>
              <IconButton>
                <FavoriteRounded fontSize="medium" />
              </IconButton>
            </Box>
            <Box>
              <Seek />
            </Box>
          </Box>
        </Box>
      </StyledPlayerContainer>
    </AudioPlayerProvider>
  );
};

const StyledPlayerContainer = styled("div")(
  ({ theme }) => `
  position: fixed;
  z-index: 1;
  bottom: 0;
  left: 0;
  height: 150px;
  width: 100%;
  background-color: ${theme.palette.background.default};
`
);
