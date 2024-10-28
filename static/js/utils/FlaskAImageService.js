//@ts-check

import { snackDanger } from "./snacks.js"

export class FlaskAImageService {
    /** @type {FlaskAImageService | null} */static #instance = null

    constructor() {
        if (FlaskAImageService.#instance !== null) return FlaskAImageService.#instance
        FlaskAImageService.#instance = this
    }

    /**
     * @param {Blob} blob 
     */
    async a(blob) {
        const formData = new FormData()
        formData.set('image', blob)

        const res = await fetch('/face-detection', {
            method: 'POST',
            body: formData
        })

        if (!res.ok) {
            const resJson = await res.json()
            return snackDanger(resJson.message)
        }

        const resBlob = await res.blob()
        const resURL = URL.createObjectURL(resBlob)

        const img = document.getElementById('result')
        if (img instanceof HTMLImageElement) {
            img.src = resURL
        }
    }
}