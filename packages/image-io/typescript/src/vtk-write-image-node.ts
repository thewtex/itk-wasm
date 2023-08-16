// Generated file. To retain edits, remove this comment.

import {
  Image,
  JsonObject,
  InterfaceTypes,
  PipelineOutput,
  PipelineInput,
  runPipelineNode
} from 'itk-wasm'

import VtkWriteImageOptions from './vtk-write-image-options.js'
import VtkWriteImageNodeResult from './vtk-write-image-node-result.js'


import path from 'path'

/**
 * Write an itk-wasm file format converted to an image file format
 *
 * @param {Image} image - Input image
 * @param {VtkWriteImageOptions} options - options object
 *
 * @returns {Promise<VtkWriteImageNodeResult>} - result object
 */
async function vtkWriteImageNode(
  image: Image,
  options: VtkWriteImageOptions = {}
) : Promise<VtkWriteImageNodeResult> {

  const mountDirs: Set<string> = new Set()

  const desiredOutputs: Array<PipelineOutput> = [
    { type: InterfaceTypes.JsonObject },
    { type: InterfaceTypes.BinaryFile },
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

  const serializedImageName = typeof options.serializedImagePath === 'undefined' ? 'serializedImage' : options.serializedImagePath
  args.push(serializedImageName)
  mountDirs.add(path.dirname(serializedImageName))

  // Options
  args.push('--memory-io')
  if (typeof options.informationOnly !== "undefined") {
    options.informationOnly && args.push('--information-only')
  }
  if (typeof options.useCompression !== "undefined") {
    options.useCompression && args.push('--use-compression')
  }

  const pipelinePath = path.join(path.dirname(import.meta.url.substring(7)), '..', 'pipelines', 'vtk-write-image')

  const {
    returnValue,
    stderr,
    outputs
  } = await runPipelineNode(pipelinePath, args, desiredOutputs, inputs, mountDirs)
  if (returnValue !== 0) {
    throw new Error(stderr)
  }

  const result = {
    couldWrite: (outputs[0].data as JsonObject).data as boolean,
    serializedImage: outputs[1].data as string,
  }
  return result
}

export default vtkWriteImageNode
