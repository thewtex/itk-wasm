import { Image } from 'itk-wasm'

interface GiplReadImageResult {
  /** WebWorker used for computation */
  webWorker: Worker | null

  /** Whether the input could be read. If false, the output image is not valid. */
  couldRead: boolean

  /** Output image */
  image: Image

}

export default GiplReadImageResult
