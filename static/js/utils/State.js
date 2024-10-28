//@ts-check

/**
 * @template T
 */
export class State {
    #value
    /** @type {Set<(newValue: T, prevValue: T) => any>} */ #listeners

    /**
     * @param {T} initialValue 
     */
    constructor(initialValue) {
        this.#value = initialValue
        this.#listeners = new Set()
    }

    get() { return this.#value }

    /**
     * @param {(newValue: T, prevValue: T) => any} listener 
     */
    addChangeListener(listener) {
        this.#listeners.add(listener)
    }

    /**
     * @param {T} newValue 
     */
    set(newValue) {
        if (this.#value !== newValue) {
            const prevValue = this.#value
            this.#value = newValue

            this.#listeners.forEach(listener => listener(newValue, prevValue))
        }
    }
}