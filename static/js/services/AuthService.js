//@ts-check

import { snackDanger } from "../utils/snacks.js"

export class AuthService {
    static #instance

    constructor() {
        if (AuthService.#instance !== null) return AuthService.#instance
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
        else {
            window.location.href = resJson.data.redirect_url
        }   
    }
}