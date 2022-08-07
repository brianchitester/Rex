import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, arrayUnion, updateDoc } from "firebase/firestore";

const classificationsCollection = "track-classifications-2"
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDuTnq5_CJJR5EQszLhkraoPjxcqdGUxKE",
    authDomain: "meta-rex.firebaseapp.com",
    projectId: "meta-rex",
    storageBucket: "meta-rex.appspot.com",
    messagingSenderId: "243124280516",
    appId: "1:243124280516:web:5b85347afc5d6f23ec3d91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);


export const storeTrackClassifications = async (trackId: string, trackMetadata: object) => {
    console.log("Storing in firebase... " + trackId)
    // Add a new document in collection "cities"
    await setDoc(doc(db, classificationsCollection, encodeURIComponent(trackId)), trackMetadata);
}

export const getTrackClasisfications = async (trackId: string) => {
    const docRef = doc(db, classificationsCollection, encodeURIComponent(trackId));
    const docSnap = await getDoc(docRef);

    console.log(docSnap.data())

    return docSnap.data();
}

export const getAllTrackClasisfications = async () => {
    const querySnapshot = await getDocs(collection(db, classificationsCollection));

    const featureVecs: any = {}
    querySnapshot.forEach((doc) => {
        const { scores } = doc.data()
        featureVecs[decodeURIComponent(doc.id)] = scores
    });

    return featureVecs;
}

export const addFavorite = async (ownerId: string, trackId: string) => {
    const currFavs = getFavorites(ownerId)
    if (!currFavs) {
        await setDoc(doc(db, "favorites", encodeURIComponent(ownerId)), { trackId: [trackId] });
    } else {
        await updateDoc(doc(db, "favorites", encodeURIComponent(ownerId)), { trackId: arrayUnion(trackId) });
    }

}

export const getFavorites = async (ownerId: string) => {
    const docRef = doc(db, "favorites", encodeURIComponent(ownerId));
    const docSnap = await getDoc(docRef);

    console.log(docSnap.data())

    if (!docSnap.data()) {
        return []
    } else {
        return docSnap.data()?.trackId;
    }
}