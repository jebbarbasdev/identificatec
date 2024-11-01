//@ts-check

import { snackDanger } from "../utils/snacks.js"

export class ProfileService {
   static #instance

    constructor() {
        if (ProfileService.#instance != null) return ProfileService.#instance
        ProfileService.#instance = this
    }

    /**
     * 
     * @returns {Promise<any[]>}
     */
    async getUserPhotos() {
        const res = await fetch('/profile/photos')
        const resJson = await res.json()

        if(!res.ok) {
            snackDanger(resJson.message)
            return []
        }

        return resJson.data
    }

    /**
     * @param {Blob} blob 
     */
    async uploadUserPhoto(blob) {
        const formData = new FormData()
        formData.set('photo', blob)

        const res = await fetch('/profile/photos', {
            method: 'POST',
            body: formData
        })

        const resJson = await res.json()
        
        if (!res.ok) {
            snackDanger(resJson.message)
        }

        return res.ok
    }
}