import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDpeuDVOz47pLtmP8zFr6KsDDU7jEAs1Uo',
  authDomain: 'hypertextfinalproj.firebaseapp.com',
  projectId: 'hypertextfinalproj',
  storageBucket: 'hypertextfinalproj.appspot.com',
  messagingSenderId: '734837980178',
  appId: '1:734837980178:web:859dfe07847134b2b9eccb',
  measurementId: 'G-20YVS4VED3',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const storage = getStorage(app)
