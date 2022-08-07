import { fetchAllTracks, fetchTrackById } from '@spinamp/spinamp-sdk';


export const getAudioSrc = async (trackId: string) => {
    const track = await fetchTrackById(trackId)

    return track?.lossyAudioUrl;
}

export const getAllTrack = async () => {
    const allTracks = await fetchAllTracks()

    return allTracks
}