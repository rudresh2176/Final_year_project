import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB_nzqkegpyNLk0hfkJwpiNxLCggu0SpeU",
  authDomain: "transformeraimonitor.firebaseapp.com",
  databaseURL: "https://transformeraimonitor-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "transformeraimonitor",
  storageBucket: "transformeraimonitor.firebasestorage.app",
  messagingSenderId: "346191997625",
  appId: "1:346191997625:web:2b9b0ef9690fa00c920968"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
