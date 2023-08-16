import { Image } from 'itk-wasm'

interface WasmZstdReadImageNodeResult {
  /** Whether the input could be read. If false, the output image is not valid. */
  couldRead: boolean

  /** Output image */
  image: Image

}

export default WasmZstdReadImageNodeResult
