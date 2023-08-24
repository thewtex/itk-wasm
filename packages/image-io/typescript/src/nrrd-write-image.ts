// Generated file. To retain edits, remove this comment.

import {
  Image,
  JsonCompatible,
  BinaryFile,
  InterfaceTypes,
  PipelineOutput,
  PipelineInput,
  runPipeline
} from 'itk-wasm'

import NrrdWriteImageOptions from './nrrd-write-image-options.js'
import NrrdWriteImageResult from './nrrd-write-image-result.js'


import { getPipelinesBaseUrl } from './pipelines-base-url.js'
import { getPipelineWorkerUrl } from './pipeline-worker-url.js'

/**
 * Write an itk-wasm file format converted to an image file format
 *
 * @param {Image} image - Input image
 * @param {NrrdWriteImageOptions} options - options object
 *
 * @returns {Promise<NrrdWriteImageResult>} - result object
 */
async function nrrdWriteImage(
  webWorker: null | Worker,
  image: Image,
  options: NrrdWriteImageOptions = {}
) : Promise<NrrdWriteImageResult> {

  const serializedImagePath = typeof options.serializedImagePath === 'undefined' ? 'serializedImage' : options.serializedImagePath
  const desiredOutputs: Array<PipelineOutput> = [
    { type: InterfaceTypes.JsonCompatible },
    { type: InterfaceTypes.BinaryFile, data: { path: serializedImagePath, data: new Uint8Array() }},
  ]

  const inputs: Array<PipelineInput> = [
    { type: InterfaceTypes.Image, data: image },
  ]

  const args = []
  // Inputs
  const imageName = '0'
  args.push(imageName as string)

  // Outputs
  const couldWriteName = '0'
  args.push(couldWriteName)

  const serializedImageName = serializedImagePath
  args.push(serializedImageName)

  // Options
  args.push('--memory-io')
  if (typeof options.informationOnly !== "undefined") {
    options.informationOnly && args.push('--information-only')
  }
  if (typeof options.useCompression !== "undefined") {
    options.useCompression && args.push('--use-compression')
  }

  const pipelinePath = 'nrrd-write-image'

  const {
    webWorker: usedWebWorker,
    returnValue,
    stderr,
    outputs
  } = await runPipeline(webWorker, pipelinePath, args, desiredOutputs, inputs, { pipelineBaseUrl: getPipelinesBaseUrl(), pipelineWorkerUrl: getPipelineWorkerUrl() })
  if (returnValue !== 0) {
    throw new Error(stderr)
  }

  const result = {
    webWorker: usedWebWorker as Worker,
    couldWrite: outputs[0].data as JsonCompatible,
    serializedImage: outputs[1].data as BinaryFile,
  }
  return result
}

export default nrrdWriteImage