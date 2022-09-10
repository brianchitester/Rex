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
import { useLocation, useNavigate } from "react-router-dom";
import { addFavorite } from "../ml/firebase";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { getTrackClasisfications } from "../ml/firebase";
import { getTrackRecommendations } from "../ml";
import { fetchTrackById } from "@spinamp/spinamp-hooks";
import TrackSquare from "./lib/TrackSquare";
import { phone, tablet } from "../constants/mediaSize";

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

  return (
    <StyledRecord seek={seek} playing={playing}>
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
    </StyledRecord>
  );
};

export const Player = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentTrack, _] = useCurrentTrack();
  const location = useLocation();
  const navigate = useNavigate();
  const { address } = useAccount();

  const trackId = currentTrack.id;
  const [mlRex, setMlRex] = useState<any>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [classifications, setClassifications] = useState<any>();

  useEffect(() => {
    (async () => {
      const c: any = await getTrackClasisfications(trackId);
      console.log(c);
      console.log(
        Object.keys(c.emotion).sort((a, b) => c.emotion[b] - c.emotion[a])[0]
      );
      setClassifications({
        emotion: Object.keys(c.emotion).sort(
          (a, b) => c.emotion[b] - c.emotion[a]
        )[0],
        genre: Object.keys(c.genre).sort((a, b) => c.genre[b] - c.genre[a])[0],
        type: Object.keys(c.type).sort((a, b) => c.type[b] - c.type[a])[0],
      });

      const rex = await getTrackRecommendations(trackId);

      const trackRex = await Promise.all(
        rex.map(async (r) => await fetchTrackById(r[1]))
      );
      console.log(trackRex);
      setMlRex(trackRex);
    })();
  }, [trackId]);

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
            alignItems: "center",
            gap: "20px",
          }}
        >
          <Box
            onClick={() => navigate(`/trackDetails/${currentTrack?.id}`)}
            sx={{
              margin: 2,
              marginRight: 0,
            }}
          >
            <CD />
          </Box>
          <Box onClick={() => navigate(`/trackDetails/${currentTrack?.id}`)}>
            <TrackTitle>{currentTrack?.title}</TrackTitle>
            <TrackArtist>{currentTrack?.artist?.name}</TrackArtist>
          </Box>
          <SmallSpacerBox />
          <Box
            sx={{
              flexGrow: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
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
                {address && (
                  <IconButton
                    onClick={() => addFavorite(address, currentTrack.id)}
                  >
                    <FavoriteRounded fontSize="medium" />
                  </IconButton>
                )}
              </Box>
              {mlRex && (
                <MlRecs>
                  <MlRecsTitle>Top Rex:</MlRecsTitle>
                  {mlRex.map((track: any) => {
                    return (
                      <TrackSquare
                        onClick={() => navigate(`/trackDetails/${track.id}`)}
                        key={track.id}
                        track={track}
                      />
                    );
                  })}
                </MlRecs>
              )}
            </Box>
            <Box>
              <Seek />
            </Box>
          </Box>
          <MedSpacerBox />
        </Box>
      </StyledPlayerContainer>
    </AudioPlayerProvider>
  );
};

const SmallSpacerBox = styled(Box)(
  ({ theme }) => `
width: 20px;
  @media (max-width: ${phone}) {
    display: none;
}
`
);

const MedSpacerBox = styled(Box)(
  ({ theme }) => `
width: 40px;
  @media (max-width: ${phone}) {
    width: 10px;

}
`
);

const StyledRecord = styled(Box)(
  ({ theme, seek, playing }) => `
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  height: 100px;
  width: 100px;
  transform: rotate(${(seek * 20) % 360}deg);
  animation: ${playing ? "rotate 10s linear infinite" : "none"};
  @media (max-width: ${phone}) {
    font-size: 1em;
    width: 50px;
    height: 50px;
}
`
);

const TrackTitle = styled("h2")(
  ({ theme }) => `
    margin: 0;
    @media (max-width: ${phone}) {
      font-size: 0.8em;
  }
  `
);

const TrackArtist = styled("div")(
  ({ theme }) => `
    @media (max-width: ${phone}) {
      font-size: 0.7em;
  }
  `
);

const MlRecs = styled("div")(
  ({ theme }) => `
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-left: 15px;
  @media (max-width: ${phone}) {
    display: none;
}
@media (max-width: ${tablet}) {
  display: none;
}
`
);

const MlRecsTitle = styled("h2")(
  ({ theme }) => `
  margin: 0;
  margin-right: 15px;
`
);

const StyledPlayerContainer = styled("div")(
  ({ theme }) => `
  border-top: 1px solid black;
  position: fixed;
  z-index: 1;
  bottom: 0;
  left: 0;
  height: 132px;
  width: 100%;
  font-family: permanent-marker, sans-serif;
  font-weight: 400;
  font-style: normal;
  background-color: ${theme.palette.background.default};
  @media (max-width: ${phone}) {
    font-family: sans-serif;
    height: 100px;
}
`
);
