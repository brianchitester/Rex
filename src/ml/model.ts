// @ts-nocheck

import * as tf from "@tensorflow/tfjs";
import { classifications, emotionClassifications, genreClassification, regionalClassifications, typeClasifications, vocalClassifications } from "./classifications";
import { resample } from "wave-resampler";

let model: tf.GraphModel;

const getWaveform = async (audioSrc: string) => {
    const audioContext = new AudioContext();

    // Download the audio file
    const resp = await fetch(audioSrc);
    const arrayBuffer = await resp.arrayBuffer();
    const audioData = await audioContext.decodeAudioData(arrayBuffer);

    const { duration, length, numberOfChannels, sampleRate } = audioData;
    console.log({ duration, length, numberOfChannels, sampleRate });

    const channelData = audioData.getChannelData(0); // Just use the left channel

    let resampledChannelData = new Float32Array(
        resample(channelData, sampleRate, 16000) // .slice(-16000 * 60) //first min of song
    );

    // console.log(resampledChannelData);
    // console.log(
    //   Math.min(...resampledChannelData),
    //   Math.max(...resampledChannelData)
    // );
    return resampledChannelData;
};

export const generateTrackClassifications = async (audioSrc: string) => {
    console.log("--------------------")
    console.log(`Generating feature vector for ${audioSrc}...`);
    if (!model) {
        const modelUrl = "https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1";
        model = await tf.loadGraphModel(modelUrl, { fromTFHub: true });
    }

    console.log("getting waveform...");
    const rawWavform = await getWaveform(audioSrc);
    console.log("making tensor...");
    const waveform = tf.tensor(rawWavform);

    console.log("generating predictions...");
    // Scores 0-1 confidence based on 521 classifications
    /* scores is a float32 Tensor of shape (N, 521) containing the per-frame
     predicted scores for each of the 521 classes in the AudioSet ontology that 
     are supported by YAMNet. See below for how to map from column index to class name.
     */

    // 1024 long feature vector, can be used for nearest comparasion
    /* embeddings is a float32 Tensor of shape (N, 1024) containing per-frame embeddings,
     where the embedding vector is the average-pooled output that feeds into the final classifier layer.
     */

    // not sure what this is useful for
    /* og_mel_spectrogram is a float32 Tensor representing the log mel spectrogram of 
    the entire waveform. These are the audio features passed into the model and have shape 
    (num_spectrogram_frames, 64) where num_spectrogram_frames is the number of frames produced from 
    the waveform by sliding a spectrogram analysis window of length 0.025 seconds with hop 0.01 seconds, 
    and 64 represents the number of mel bins.
    */
    const [
        scoresTensor,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        embeddingsTensor,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        spectrogram,
    ] = model.predict(waveform);

    console.log("done predicting");

    const res = await scoresTensor.array();
    const scores = res[0] // for some reason this is an array of length 5 with dup entries?
        .map((feature, i) => [
            classifications[i],
            Math.round(feature * 100000) / 100000,
            i,
        ])
        .filter((feature) => feature[1] > 0) // get rid of stuff we know it isn't
        // .filter((feature) => feature[2] >= 132 && feature[2] <= 276) // get music only
        .map((x) => x.slice(0, 2))
        .sort((a, b) => b[1] - a[1]);

    console.log(JSON.stringify(scores));

    const reduceSubCategories = (category) => {
        return scores
            // Filter the scores in the genre
            .filter(score => Object.values(category)
                .flat()
                .includes(score[0])
            )
            // Get reduce to the subgenre classification
            .reduce((c, score) => {
                const classification = Object.keys(category).find(k => category[k].includes(score[0]))

                const round = (x) => Math.round(x * 100000) / 100000
                return { ...c, [classification]: c[classification] ? round(c[classification] + score[1]) : round(score[1]) }
            }, {})
    }

    const genre = reduceSubCategories(genreClassification)
    console.log(genre)

    const vocal = reduceSubCategories(vocalClassifications)
    console.log(vocal)

    const regional = reduceSubCategories(regionalClassifications)
    console.log(regional)

    const type = reduceSubCategories(typeClasifications)
    console.log(type)

    const emotion = reduceSubCategories(emotionClassifications)
    console.log(emotion)

    // scores.print(true); // shape [N, 521]
    // embeddings.print(true); // shape [N, 1024]
    // spectrogram.print(true); // shape [M, 64]

    // Find class with the top score when mean-aggregated across frames.
    // scores.mean(0).argMax().print(true);
    // Should print 494 corresponding to 'Silence' in YAMNet Class Map.

    // const embeddings = await embeddingsTensor.array()

    // console.log(embeddings)

    return {
        scores: res[0],
        genre,
        vocal,
        regional,
        type,
        emotion
    }
};

