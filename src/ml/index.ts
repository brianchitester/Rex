import { getAllTrack } from "./spinamp";
import { getAllTrackClasisfications, getTrackClasisfications, storeTrackClassifications } from "./firebase"
import { generateTrackClassifications } from "./model"
const { RateLimit } = require('async-sema');
const { euclidean } = require('ml-distance-euclidean');

export const runBulkAnalysis = async (s = 0, n = 10) => {
    const tracks = await getAllTrack();

    const lim = RateLimit(6); // rps
    const promises = tracks.items.slice(s, n).map(async (track, i) => {
        await lim();
        console.log("============== Analyzing " + i + " ===============")
        const prevRes = await getTrackClasisfications(track.id)
        if (prevRes) {
            console.log("skipping " + track.id)
            return
        }
        const res = await generateTrackClassifications(track.lossyAudioUrl)
        await storeTrackClassifications(track.id, res)
        console.log("done " + track.id)
    })

    await Promise.allSettled(promises)

    console.log("============= Finished bulk Analysis =============")
}

export const getTrackRecommendations = async (trackId: string) => {
    const trackClassifications: any = await getAllTrackClasisfications()

    console.log(trackClassifications)
    const base = trackClassifications[trackId]

    if (!base) { return [] }

    const res = Object.keys(trackClassifications)
        .filter(compareTrackId => compareTrackId !== trackId)
        .map(compareTrackId => (
            [euclidean(base, trackClassifications[compareTrackId]), compareTrackId]
        ))
        .sort((a, b) => (b[0] - a[0]))
        .reverse()
        .splice(0, 5)

    return res
}