//@ts-check

import { DummyQuery } from "./$.js";

export class Button {
    #dummyBtn
    #loading

    #daycare

    /**
     * 
     * @param {DummyQuery<HTMLElement>} dummyBtn 
     */
    constructor(dummyBtn) {
        this.#dummyBtn = dummyBtn
        this.#loading = false
        this.#daycare = null
    }

    /**
     * 
     * @param {boolean} [value] 
     */
    loading(value) {
        if (value === undefined) return this.#loading
        this.#loading = value

        if (this.#loading) {
            this.#daycare = this.#dummyBtn.match.innerHTML
            this.#dummyBtn.match.innerHTML = `
                Loading...
            `
        }
        else {
            this.#dummyBtn.match.innerHTML = this.#daycare
        }
    }
}

/**
 * 
 * @param {DummyQuery<HTMLElement>} dummyBtn 
 * @returns 
 */
export function button(dummyBtn) {
    return new Button(dummyBtn)
}