import { setPipelineWorkerUrl } from './index.js'
import pipelineWorker from '../node_modules/itk-wasm/dist/core/web-workers/bundles/itk-wasm-pipeline.worker.js'
setPipelineWorkerUrl(pipelineWorker)

export * from './index.js'
