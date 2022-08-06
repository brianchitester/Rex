import { ITrack } from "@spinamp/spinamp-sdk";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

const CurrentTrackContext = createContext<
  [ITrack, Dispatch<SetStateAction<ITrack>>] | undefined
>(undefined);

export const useCurrentTrack = (): [
  ITrack,
  Dispatch<SetStateAction<ITrack>>
] => {
  const currentTrack = useContext(CurrentTrackContext);
  if (!currentTrack) {
    throw new Error("Make sure to have a CurrentTrackProvider");
  }

  return currentTrack;
};

type CurrentTrackProviderProps = {
  defaultTrack: ITrack;
  children?: ReactNode;
};

export const CurrentTrackProvider = ({
  defaultTrack,
  children,
}: CurrentTrackProviderProps) => {
  const [currentTrack, setCurrentTrack] = useState(defaultTrack);

  return (
    <CurrentTrackContext.Provider value={[currentTrack, setCurrentTrack]}>
      {children}
    </CurrentTrackContext.Provider>
  );
};
