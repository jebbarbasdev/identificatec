//@ts-check

import { FlaskAImageService } from '../utils/FlaskAImageService.js'
import { AuthService } from '../services/AuthService.js'
import { State } from '../utils/State.js'
import { $, DummyQuery } from '../utils/$.js'
import { snackDanger } from '../utils/snacks.js'
import { Photoshooter } from '../utils/Photoshooter.js'

const bootstrap = globalThis.bootstrap

const _flaskAImageService = new FlaskAImageService()
const _authService = new AuthService()

const photoshooter = new Photoshooter('#photoshooter')

const txtEmail = $('#txtEmail')
const txtPassword = $('#txtPassword')

const btnFaceRecognition = $('#btnFaceRecognition')
const btnLogin = $('#btnLogin')
//const btnFacingModeToggler = $('.video-facing-mode-toggler')

const mdlFaceRecognitionElement = $('#mdlFaceRecognition')
const mdlFaceRecognition = new bootstrap.Modal('#mdlFaceRecognition')

/** @type {number|null} */
let detectorInterval = null

const streamingState = new State(false)
streamingState.addChangeListener(async streaming => {
    if (streaming) {
        await photoshooter.start()

        detectorInterval = setInterval(() => {
            console.log('Detecto')
        }, 1000)
    }
    else {
        if (detectorInterval !== null) {
            clearInterval(detectorInterval)
            detectorInterval = null
        }

        photoshooter.stop()
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