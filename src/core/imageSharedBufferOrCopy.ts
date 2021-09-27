import copyImage from './copyImage.js'
import Image from './Image.js'

const haveSharedArrayBuffer = typeof window.SharedArrayBuffer === 'function'

/** If SharedArrayBuffer's are available, ensure an itk.Image's buffer is a
 * SharedArrayBuffer. If SharedArrayBuffer's are not available, return a copy.
 * */
function imageSharedBufferOrCopy(image: Image): Image {
  if (image.data === null) {
    return image
  }
  if (haveSharedArrayBuffer) {
    if (image.data.buffer instanceof SharedArrayBuffer) { // eslint-disable-line
      return image
    }

    const sharedBuffer = new SharedArrayBuffer(image.data.buffer.byteLength) // eslint-disable-line
    const ctor = image.data.constructor as { new(buffer: SharedArrayBuffer): typeof image.data }
    const sharedTypedArray = new ctor(sharedBuffer)
    if (sharedTypedArray !== null) {
      sharedTypedArray.set(image.data, 0)
    }
    image.data = sharedTypedArray
    return image
  } else {
    return copyImage(image)
  }
}

export default imageSharedBufferOrCopy