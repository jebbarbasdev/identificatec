//@ts-check

export class Photoshooter {
    /** @type {HTMLDivElement} */ #wrapper
    /** @type {HTMLVideoElement} */ #video

    #streaming
    /** @type {MediaStream|null} */ #stream

    #facingMode
    
    /**
     * 
     * @param {HTMLElement | string} wrapperElement 
     * @param {Partial<{ initialFacingMode: 'user' | 'environment'}>} [initOptions]
     */
    constructor(wrapperElement, initOptions) {
        const wrapper = typeof wrapperElement === 'string' ? document.querySelector(wrapperElement) : wrapperElement 
        
        this.#wrapper = document.createElement('div')
        Object.assign(this.#wrapper, {
            style: 'position: relative; height: 100%; aspect-ratio: 4/3;'
        })

        this.#video = document.createElement('video')
        Object.assign(this.#video, {
            style: 'width: 100%; height: 100%; position: absolute; object-fit: cover;',
            autoplay: true
        })

        this.#wrapper.appendChild(this.#video)
        wrapper?.replaceWith(this.#wrapper)
        
        const desiredFacingMode = initOptions?.initialFacingMode ?? 'user'
        if (!['user', 'environment'].includes(desiredFacingMode)) {
            throw new Error(`Photoshooter: "${desiredFacingMode}" facing mode is not valid, choose only "user" or "environment"`)
        }
        this.#facingMode = desiredFacingMode

        this.#streaming = false
        this.#stream = null
    }

    /**
     * @returns {Promise<[MediaStream, MediaStreamTrack]>}
     */
    async #getUserVideoStream() {
        if (!(location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
            throw new Error('Photoshooter: You need to be in a secure context (https) or in localhost in order to use video stream')
        }

        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            throw new Error('Photoshooter: Video stream not available in your browser')
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: this.#facingMode }})
        return [stream, stream.getVideoTracks()[0]]
    }

    /**
     * @param {MediaStreamTrack} track 
     */
    #setFacingModeUsingTrack(track) {
        const facingMode = track.getSettings().facingMode

        if (facingMode === 'environment') {
            this.#facingMode = 'environment'
        } else if (facingMode === 'user') {
            this.#facingMode = 'user'
        }
    }

    get #isMirrored() { return this.#facingMode === 'user' }

    async start() {
        if (!this.#streaming) {
            const [stream, track] = await this.#getUserVideoStream()
            this.#setFacingModeUsingTrack(track)
    
            this.#video.style.transform = this.#isMirrored ? 'scaleX(-1)' : ''
            this.#video.srcObject = stream
            this.#video.play() // In case autoplay was blocked
    
            this.#stream = stream
            this.#streaming = true
        }
    }

    stop() {
        if (this.#streaming && this.#stream) {
            this.#stream.getTracks().forEach(
                track => track.stop()
            )

            this.#video.srcObject = null
            this.#stream = null
            this.#streaming = false
        }
    }

    async toggleFacingMode() {
        this.#facingMode = this.#facingMode === 'user' ? 'environment' : 'user'
        this.stop()
        await this.start()
    }

    /**
     * @param {string} format 
     * @returns {Promise<Blob>}
     */
    async toBlob(format = 'image/png') {
        return new Promise(resolve => {
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
    
            if (!context) throw new Error('Photoshooter: Canvas 2D Context is not defined')
    
            // Establece el tamaño del canvas para que coincida con el video
            canvas.width = this.#video.videoWidth;
            canvas.height = this.#video.videoHeight;
    
            const mirrored = this.#isMirrored

            // Si está mirror, debo invertir la imagen
            if (mirrored) {
                // Invertir el eje X
                context.save()
                context.scale(-1, 1)

                // Dibuja el fotograma del video en el canvas
                context.drawImage(this.#video, -canvas.width, 0, canvas.width, canvas.height);

                // Restaurar el contexto para que no afecte las operaciones futuras
                context.restore()
            }
            else {
                // Dibuja el fotograma del video en el canvas
                context.drawImage(this.#video, 0, 0, canvas.width, canvas.height);
            }

            // Convierte el canvas a Blob (imagen PNG)
            canvas.toBlob(blob => {
                if (blob) {
                    resolve(blob)
                }
                else {
                    throw new Error('Photoshooter: Blob is not defined')
                }
                
            }, format);
        })
    }
}