import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";

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