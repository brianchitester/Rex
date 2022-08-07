import {
  ReactNode,
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
} from "react";
import { useCurrentTrack } from "./CurrentTrackContext";

const AudioPlayerContext = createContext<
  | {
      playing: boolean;
      togglePlayPause: () => void;
      seek: number;
      seekTo: (newSeek: number) => void;
      duration: number;
    }
  | undefined
>(undefined);

export const useAudioPlayerControls = () => {
  const audioPlayerContext = useContext(AudioPlayerContext);

  if (!audioPlayerContext) {
    throw new Error("Make sure to have a AudioPlayerProvider");
  }

  return {
    playing: audioPlayerContext.playing,
    togglePlayPause: audioPlayerContext.togglePlayPause,
  };
};

export const useAudioPlayerSeek = () => {
  const audioPlayerContext = useContext(AudioPlayerContext);

  if (!audioPlayerContext) {
    throw new Error("Make sure to have a AudioPlayerProvider");
  }

  return {
    seek: audioPlayerContext.seek,
    seekTo: audioPlayerContext.seekTo,
    duration: audioPlayerContext.duration,
  };
};

type AudioPlayerProviderProps = {
  children?: ReactNode;
};

export const AudioPlayerProvider = ({ children }: AudioPlayerProviderProps) => {
  const [playing, setPlaying] = useState(false);
  const [seek, setSeek] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentTrack, _] = useCurrentTrack();
  const [duration, setDuration] = useState(0);

  const audioPollRef = useRef<NodeJS.Timer>();

  const audioRef = useRef(new Audio(currentTrack.lossyAudioUrl));

  // Update the src and reset the seeks if the song is changed
  useEffect(() => {
    audioRef.current.src = currentTrack.lossyAudioUrl;
    setSeek(0);
    audioRef.current.play();
    setPlaying(true);
    pollAudioData();
  }, [currentTrack]);

  const pollAudioData = () => {
    // Clear any timers already running
    clearInterval(audioPollRef.current);

    audioPollRef.current = setInterval(() => {
      setSeek(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }, 30);
  };

  const togglePlayPause = () => {
    if (playing) {
      audioRef.current.pause();
      clearInterval(audioPollRef.current);
    } else {
      audioRef.current.play();
      pollAudioData();
    }

    setPlaying(!playing);
  };

  const seekTo = (newSeek: number) => {
    audioRef.current.currentTime = newSeek;
    setSeek(newSeek);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        playing,
        togglePlayPause,
        seek,
        seekTo,
        duration,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};
