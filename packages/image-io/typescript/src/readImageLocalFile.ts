import path from 'path'
import mime from 'mime-types'

import { getFileExtension, Image, loadEmscriptenModule, runPipelineEmscripten, PipelineEmscriptenModule, InterfaceTypes, PipelineInput, CastImageOptions, castImage } from 'itk-wasm'

import mimeToIO from './internal/MimeToImageIO.js'
import extensionToIO from './extensionToImageIO.js'
import ImageIOIndex from './internal/ImageIOIndex.js'

import findLocalImageIOPath from './internal/findLocalImageIOPath.js'

/**
 * Read an image from a file on the local filesystem in Node.js.
 *
 * @param: filePath path to the file on the local filesystem.
 * @param {CastImageOptions} options - specify the componentType and/or pixelType of the output
 */
async function readImageLocalFile (filePath: string, options?: CastImageOptions): Promise<Image> {
  const imageIOsPath = findLocalImageIOPath()
  const absoluteFilePath = path.resolve(filePath)
  const mimeType = mime.lookup(absoluteFilePath)
  const extension = getFileExtension(absoluteFilePath)

  const args = [absoluteFilePath, '0', '--memory-io', '--quiet']
  const desiredOutputs = [
    { type: InterfaceTypes.Image }
  ]
  const inputs = [] as PipelineInput[]

  let io = null
  if (mimeType !== false && mimeToIO.has(mimeType)) {
    io = mimeToIO.get(mimeType)
  } else if (extensionToIO.has(extension)) {
    io = extensionToIO.get(extension)
  } else {
    for (let idx = 0; idx < ImageIOIndex.length; ++idx) {
      const modulePath = path.join(imageIOsPath, ImageIOIndex[idx] + '-read-image.js')
      const readImageModule = await loadEmscriptenModule(modulePath) as PipelineEmscriptenModule
      const mountedFilePath = readImageModule.mountContainingDir(absoluteFilePath)
      const { returnValue, outputs } = runPipelineEmscripten(readImageModule, args, desiredOutputs, inputs)
      readImageModule.unmountContainingDir(mountedFilePath)
      if (returnValue === 0) {
        return outputs[0].data as Image
      }
    }
  }
  if (io === null) {
    throw Error('Could not find IO for: ' + absoluteFilePath)
  }

  const modulePath = path.join(imageIOsPath, io as string + '-read-image.js')
  const readImageModule = await loadEmscriptenModule(modulePath) as PipelineEmscriptenModule
  const mountedFilePath = readImageModule.mountContainingDir(absoluteFilePath)
  const { outputs } = runPipelineEmscripten(readImageModule, args, desiredOutputs, inputs)
  readImageModule.unmountContainingDir(mountedFilePath)
  let result = outputs[0].data as Image

  if (typeof options !== 'undefined') {
    result = castImage(result, options)
  }

  return result
}

export default readImageLocalFile