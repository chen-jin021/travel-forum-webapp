import { storage } from '../../firebase'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'

// upload img to google cloud storage and return URL
export const upload = async (file: any): Promise<string> => {
  if (!file) return 'empty file!'
  const storageRef = ref(storage, `/files/${file.name}`)
  const uploadTask = await uploadBytesResumable(storageRef, file)
  const url: string = await getDownloadURL(uploadTask.ref)
  return url
}
