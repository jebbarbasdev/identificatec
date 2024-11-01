//@ts-check

export class Photoshooter {
    /** @type {HTMLDivElement} */ #wrapper
    /** @type {HTMLVideoElement} */ #video
    /** @type {HTMLCanvasElement} */ #canvas
    /** @type {CanvasRenderingContext2D} */ #canvasContext

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
            style: 'width: 100%; height: 100%; position: absolute; object-fit: cover; display: block;',
            autoplay: true
        })

        this.#canvas = document.createElement('canvas')
        Object.assign(this.#canvas, {
            style: 'width: 100%; height: 100%; position: absolute; object-fit: cover; display: none;',
        })

        //@ts-ignore
        this.#canvasContext = this.#canvas.getContext('2d')

        this.#wrapper.appendChild(this.#video)
        this.#wrapper.appendChild(this.#canvas)
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

    #unfreeze() {
        this.#video.style.display = 'block'
        this.#canvas.style.display = 'none'
    }

    async start() {
        if (!this.#streaming) {
            const [stream, track] = await this.#getUserVideoStream()
            this.#setFacingModeUsingTrack(track)
    
            this.#unfreeze()

            this.#video.style.transform = this.#isMirrored ? 'scaleX(-1)' : ''
            this.#video.srcObject = stream
            this.#video.play() // In case autoplay was blocked
    
            this.#stream = stream
            this.#streaming = true
        }
    }

    #drawVideoFrameInCanvas() {
        // Establece el tamaño del canvas para que coincida con el video
        this.#canvas.width = this.#video.videoWidth;
        this.#canvas.height = this.#video.videoHeight;

        const mirrored = this.#isMirrored

        // Si está mirror, debo invertir la imagen
        if (mirrored) {
            // Invertir el eje X
            this.#canvasContext.save()
            this.#canvasContext.scale(-1, 1)

            // Dibuja el fotograma del video en el canvas
            this.#canvasContext.drawImage(this.#video, -this.#canvas.width, 0, this.#canvas.width, this.#canvas.height);

            // Restaurar el contexto para que no afecte las operaciones futuras
            this.#canvasContext.restore()
        }
        else {
            // Dibuja el fotograma del video en el canvas
            this.#canvasContext.drawImage(this.#video, 0, 0, this.#canvas.width, this.#canvas.height);
        }
    }

    #freeze() {
        this.#drawVideoFrameInCanvas()

        this.#video.style.display = 'none'
        this.#canvas.style.display = 'block'
    }

    stop(freeze = false) {
        if (this.#streaming && this.#stream) {
            freeze ? this.#freeze() : this.#unfreeze()

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
            // Si esta grabando, toma lo que esta grabando, si esta parado
            // entonces infiere que le hicieron un freeze
            if (this.#streaming && this.#stream) {
                this.#drawVideoFrameInCanvas()
            }

            // Convierte el canvas a Blob (imagen PNG)
            this.#canvas.toBlob(blob => {
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