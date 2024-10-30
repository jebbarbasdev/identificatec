//@ts-check

import { FlaskAImageService } from '../utils/FlaskAImageService.js'
import { AuthService } from '../services/AuthService.js'
import { State } from '../utils/State.js'
import { $, DummyQuery } from '../utils/$.js'
import { snackDanger } from '../utils/snacks.js'
import { Photoshooter } from '../utils/Photoshooter.js'

const bootstrap = globalThis.bootstrap

const _flaskAImageService = new FlaskAImageService()

const photoshooter = new Photoshooter('#photoshooter')

const btnAddPhoto = $('#btnAddFace')
const btnTakePhoto = $('#btnTakePhoto')
const btnCancelPhoto = $('#btnCancelPhoto')
const btnConfirmPhoto = $('#btnConfirmPhoto')

const mdlTakePhotoElement = $('#mdlTakePhoto')
const mdlTakePhoto = new bootstrap.Modal('#mdlTakePhoto')

function toggleToConfirmPhoto() {
    $('#mdlTakePhotoLabel').prop('textContent', 'Confirm Photo?')
    
    btnTakePhoto.css('display', 'none')
    btnCancelPhoto.css('display', '')
    btnConfirmPhoto.css('display', '')
    
    photoshooter.stop(true)
}

async function toggleToTakePhoto() {
    $('#mdlTakePhotoLabel').prop('textContent', 'Take Photo')
    
    btnTakePhoto.css('display', '')
    btnCancelPhoto.css('display', 'none')
    btnConfirmPhoto.css('display', 'none')
    
    await photoshooter.start()
}

btnAddPhoto.on('click', e => {
    mdlTakePhoto.show()
})

btnTakePhoto.on('click', e => {
    toggleToConfirmPhoto()
})

btnCancelPhoto.on('click', async e => {
    await toggleToTakePhoto()
})

btnConfirmPhoto.on('click', async e => {
    console.log('Subiendo Foto...')
})

mdlTakePhotoElement.on('show.bs.modal', e => {
    // On modal open, start recording
    photoshooter.start()
})

mdlTakePhotoElement.on('hide.bs.modal', e => {
    // On hide, stop recording
    photoshooter.stop()
})