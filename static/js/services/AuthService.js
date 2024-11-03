//@ts-check

import { snackDanger } from "../utils/snacks.js"

export class AuthService {
    static #instance

    constructor() {
        if (AuthService.#instance != null) return AuthService.#instance
        AuthService.#instance = this
    }

    /**
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        const res = await fetch('/auth/login', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        const resJson = await res.json()

        if (!res.ok) {
            return snackDanger(resJson.message)
        }
         
        window.location.href = resJson.data.redirect_url
    }

    /**
     * @param {Blob} blob 
     */
    async recognition(blob) {
        const formData = new FormData()
        formData.set('photo', blob)

        const res = await fetch('/auth/recognition', {
            method: 'POST',
            body: formData
        })

        const resJson = await res.json()
        return resJson.data
    }
}