import { copyImage } from 'itk-wasm'
import * as imageIo from '../../../dist/index.js'
import bmpWriteImageLoadSampleInputs, { usePreRun } from "./bmp-write-image-load-sample-inputs.js"

class BmpWriteImageModel {
  inputs: Map<string, any>
  options: Map<string, any>
  outputs: Map<string, any>

  constructor() {
    this.inputs = new Map()
    this.options = new Map()
    this.outputs = new Map()
    }
}


class BmpWriteImageController {

  constructor(loadSampleInputs) {
    this.loadSampleInputs = loadSampleInputs

    this.model = new BmpWriteImageModel()
    const model = this.model

    this.webWorker = null

    if (loadSampleInputs) {
      const loadSampleInputsButton = document.querySelector("#bmpWriteImageInputs [name=loadSampleInputs]")
      loadSampleInputsButton.setAttribute('style', 'display: block-inline;')
      loadSampleInputsButton.addEventListener('click', async (event) => {
        loadSampleInputsButton.loading = true
        await loadSampleInputs(model)
        loadSampleInputsButton.loading = false
      })
    }

    // ----------------------------------------------
    // Inputs
    const imageElement = document.querySelector('#bmpWriteImageInputs input[name=image-file]')
    imageElement.addEventListener('change', async (event) => {
        const dataTransfer = event.dataTransfer
        const files = event.target.files || dataTransfer.files

        const { image, webWorker } = await imageIo.readImage(null, files[0])
        webWorker.terminate()
        model.inputs.set("image", image)
        const details = document.getElementById("bmpWriteImage-image-details")
        details.innerHTML = `<pre>${globalThis.escapeHtml(JSON.stringify(image, globalThis.interfaceTypeJsonReplacer, 2))}</pre>`
        details.disabled = false
    })

    const serializedImageElement = document.querySelector('#bmpWriteImageInputs sl-input[name=serialized-image]')
    serializedImageElement.addEventListener('sl-change', (event) => {
        model.inputs.set("serializedImage", serializedImageElement.value)
    })

    // ----------------------------------------------
    // Options
    const informationOnlyElement = document.querySelector('#bmpWriteImageInputs sl-checkbox[name=information-only]')
    informationOnlyElement.addEventListener('sl-change', (event) => {
        model.options.set("informationOnly", informationOnlyElement.checked)
    })

    const useCompressionElement = document.querySelector('#bmpWriteImageInputs sl-checkbox[name=use-compression]')
    useCompressionElement.addEventListener('sl-change', (event) => {
        model.options.set("useCompression", useCompressionElement.checked)
    })

    // ----------------------------------------------
    // Outputs
    const couldWriteOutputDownload = document.querySelector('#bmpWriteImageOutputs sl-button[name=could-write-download]')
    couldWriteOutputDownload.addEventListener('click', async (event) => {
        event.preventDefault()
        event.stopPropagation()
        if (model.outputs.has("couldWrite")) {
            const fileName = `couldWrite.json`
            globalThis.downloadFile(new TextEncoder().encode(JSON.stringify(model.outputs.get("couldWrite"))), fileName)
        }
    })

    const serializedImageOutputDownload = document.querySelector('#bmpWriteImageOutputs sl-button[name=serialized-image-download]')
    serializedImageOutputDownload.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        if (model.outputs.has("serializedImage")) {
            globalThis.downloadFile(model.outputs.get("serializedImage").data, model.outputs.get("serializedImage").path)
        }
    })

    const preRun = async () => {
      if (!this.webWorker && loadSampleInputs && usePreRun) {
        await loadSampleInputs(model, true)
        await this.run()
      }
    }

    const onSelectTab = async (event) => {
      if (event.detail.name === 'bmpWriteImage-panel') {
        const params = new URLSearchParams(window.location.search)
        if (!params.has('functionName') || params.get('functionName') !== 'bmpWriteImage') {
          params.set('functionName', 'bmpWriteImage')
          const url = new URL(document.location)
          url.search = params
          window.history.replaceState({ functionName: 'bmpWriteImage' }, '', url)
          await preRun()
        }
      }
    }

    const tabGroup = document.querySelector('sl-tab-group')
    tabGroup.addEventListener('sl-tab-show', onSelectTab)
    function onInit() {
      const params = new URLSearchParams(window.location.search)
      if (params.has('functionName') && params.get('functionName') === 'bmpWriteImage') {
        tabGroup.show('bmpWriteImage-panel')
        preRun()
      }
    }
    onInit()

    const runButton = document.querySelector('#bmpWriteImageInputs sl-button[name="run"]')
    runButton.addEventListener('click', async (event) => {
      event.preventDefault()

      if(!model.inputs.has('image')) {
        globalThis.notify("Required input not provided", "image", "danger", "exclamation-octagon")
        return
      }


      try {
        runButton.loading = true

        const t0 = performance.now()
        const { couldWrite, serializedImage, } = await this.run()
        const t1 = performance.now()
        globalThis.notify("bmpWriteImage successfully completed", `in ${t1 - t0} milliseconds.`, "success", "rocket-fill")

        model.outputs.set("couldWrite", couldWrite)
        couldWriteOutputDownload.variant = "success"
        couldWriteOutputDownload.disabled = false
        const couldWriteDetails = document.getElementById("bmpWriteImage-could-write-details")
        couldWriteDetails.innerHTML = `<pre>${globalThis.escapeHtml(JSON.stringify(couldWrite, globalThis.interfaceTypeJsonReplacer, 2))}</pre>`
        couldWriteDetails.disabled = false
        const couldWriteOutput = document.getElementById("bmpWriteImage-could-write-details")

        model.outputs.set("serializedImage", serializedImage)
        serializedImageOutputDownload.variant = "success"
        serializedImageOutputDownload.disabled = false
        const serializedImageOutput = document.getElementById("bmpWriteImage-serialized-image-details")
        serializedImageOutput.innerHTML = `<pre>${globalThis.escapeHtml(serializedImage.data.subarray(0, 1024).toString() + ' ...')}</pre>`
        serializedImageOutput.disabled = false
      } catch (error) {
        globalThis.notify("Error while running pipeline", error.toString(), "danger", "exclamation-octagon")
        throw error
      } finally {
        runButton.loading = false
      }
    })
  }

  async run() {
    const { webWorker, couldWrite, serializedImage, } = await imageIo.bmpWriteImage(this.webWorker,
      copyImage(this.model.inputs.get('image')),
      this.model.inputs.get('serializedImage'),
      Object.fromEntries(this.model.options.entries())
    )
    this.webWorker = webWorker

    return { couldWrite, serializedImage, }
  }
}

const bmpWriteImageController = new BmpWriteImageController(bmpWriteImageLoadSampleInputs)
