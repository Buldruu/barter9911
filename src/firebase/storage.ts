import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { requireStorage } from './config'

/**
 * Upload an array of image files to Firebase Storage under a user's folder and
 * return their public download URLs.
 */
export async function uploadListingImages(
  files: File[],
  userId: string,
  onProgress?: (done: number, total: number) => void
): Promise<string[]> {
  const storage = requireStorage()
  const urls: string[] = []
  let done = 0
  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `listings/${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}-${safeName}`
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/jpeg',
    })
    const url = await getDownloadURL(snapshot.ref)
    urls.push(url)
    done += 1
    onProgress?.(done, files.length)
  }
  return urls
}
