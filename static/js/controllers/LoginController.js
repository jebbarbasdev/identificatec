//@ts-check

import { AuthService } from '../services/AuthService.js'
import { State } from '../utils/State.js'
import { $ } from '../utils/$.js'
import { snackDanger } from '../utils/snacks.js'
import { Photoshooter } from '../utils/Photoshooter.js'

const bootstrap = globalThis.bootstrap

const _authService = new AuthService()

const photoshooter = new Photoshooter('#photoshooter')

const txtEmail = $('#txtEmail')
const txtPassword = $('#txtPassword')

const btnFaceRecognition = $('#btnFaceRecognition')
const btnLogin = $('#btnLogin')
//const btnFacingModeToggler = $('.video-facing-mode-toggler')

const mdlFaceRecognitionElement = $('#mdlFaceRecognition')
const mdlFaceRecognition = new bootstrap.Modal('#mdlFaceRecognition')

const mdlFaceRecognitionResult = $('#mdlFaceRecognitionResult')

let requestRecognition = true
async function tryRecognition() {
    if (requestRecognition) {
        requestRecognition = false

        mdlFaceRecognitionResult.match.classList.add('text-bg-warning')
        mdlFaceRecognitionResult.text('Recognizing')

        const photo = await photoshooter.toBlob()
        const recognitionData = await _authService.recognition(photo)

        if (recognitionData === null) {
            requestRecognition = true
        }
        else {
            mdlFaceRecognitionResult.match.classList.remove('text-bg-warning')
            mdlFaceRecognitionResult.match.classList.add('text-bg-success')
            mdlFaceRecognitionResult.text(recognitionData.user_name)

            console.log(`You're ${recognitionData.user_name} with a distance of ${recognitionData.distance}`)

            setTimeout(() => {
                window.location.href = recognitionData.redirect_url
            }, 1000)
        }
    }
}

/** @type {number|null} */
let detectorInterval = null

const streamingState = new State(false)
streamingState.addChangeListener(async streaming => {
    if (streaming) {
        await photoshooter.start()
        detectorInterval = setInterval(tryRecognition, 2000)
    }
    else {
        if (detectorInterval !== null) {
            clearInterval(detectorInterval)
            detectorInterval = null
        }

        photoshooter.stop()

        mdlFaceRecognitionResult.match.classList.remove('text-bg-warning', 'text-bg-success')
        mdlFaceRecognitionResult.text('Smile!')

        requestRecognition = true
    }
})

btnFaceRecognition.on('click', e => {
    mdlFaceRecognition.show()
})

txtEmail.on('keypress', e => {
    if (e.key === 'Enter') {
        txtPassword.match.focus()
    }
})

txtPassword.on('keypress', e => {
    if (e.key === 'Enter') {
        btnLogin.match.click()
    }
})

btnLogin.on('click', async e => {
    const email = txtEmail.val() + ''
    const password = txtPassword.val() + ''

    if (email.trim() === '') return snackDanger('Please provide your email to continue')
    if (password.trim() === '') return snackDanger('Please provide your password to continue')

    btnLogin.prop('disabled', true)
    await _authService.login(email, password)
    btnLogin.prop('disabled', false)
})

// btnFacingModeToggler.on('click', e => {
//     videoUser.match.toggleFacingMode()
// })

mdlFaceRecognitionElement.on('show.bs.modal', e => {
    // On modal open, start recording
    streamingState.set(true)
})

mdlFaceRecognitionElement.on('hide.bs.modal', e => {
    // On hide, stop recording
    streamingState.set(false)
})

// document.addEventListener('visibilitychange', e => {
//     streamingState.set(document.visibilityState === 'visible')
// })