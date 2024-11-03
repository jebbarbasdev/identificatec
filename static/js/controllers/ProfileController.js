//@ts-check

import { ProfileService } from '../services/ProfileService.js'
import { AuthService } from '../services/AuthService.js'
import { State } from '../utils/State.js'
import { $, DummyQuery } from '../utils/$.js'
import { snackDanger, snackSuccess } from '../utils/snacks.js'
import { Photoshooter } from '../utils/Photoshooter.js'
import { button } from '../utils/button.js'

/**
 * @typedef {Object} Photo
 * @prop {number} id
 * @prop {string} url
 */

const bootstrap = globalThis.bootstrap

const _profileService = new ProfileService()

const photoshooter = new Photoshooter('#photoshooter')

const btnAddPhoto = $('#btnAddFace')
const btnTakePhoto = $('#btnTakePhoto')
const btnCancelPhoto = $('#btnCancelPhoto')
const btnConfirmPhoto = $('#btnConfirmPhoto')

const mdlTakePhotoElement = $('#mdlTakePhoto')
const mdlTakePhoto = new bootstrap.Modal('#mdlTakePhoto')

const lblFacesQuantity = $('#facesQuantity')
const facesContainer = $('#faces')

/** @type {State<Photo[]>} */ //@ts-ignore
const photos = new State([])
photos.addChangeListener(newPhotos => {
    facesContainer.match.innerHTML = ''
    lblFacesQuantity.prop('textContent', newPhotos.length)
    
    const newImages = newPhotos.map(newPhoto => {
        const newImg = document.createElement('img')
        Object.assign(newImg, {
            alt: `Image ${newPhoto.id}`,
            src: newPhoto.url,
            width: '100',
        })

        return newImg
    })
    
    facesContainer.match.append(...newImages)
})

async function reloadPhotos() {
    const newPhotos = await _profileService.getUserPhotos()
    photos.set(newPhotos)
}

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

async function closeModal() {
    $('#mdlTakePhotoLabel').prop('textContent', 'Take Photo')
    
    btnTakePhoto.css('display', '')
    btnCancelPhoto.css('display', 'none')
    btnConfirmPhoto.css('display', 'none')

    photoshooter.stop()
    mdlTakePhoto.hide()
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
    const enhancedBtnConfirmPhoto = button(btnConfirmPhoto)
    
    btnCancelPhoto.prop('disabled', true)
    btnConfirmPhoto.prop('disabled', true)
    enhancedBtnConfirmPhoto.loading(true)

    const photo = await photoshooter.toBlob()
    const ok = await _profileService.uploadUserPhoto(photo)

    if (ok) {
        await reloadPhotos()
        closeModal()

        snackSuccess('Photo uploaded successfully')
    }

    btnCancelPhoto.prop('disabled', false)
    enhancedBtnConfirmPhoto.loading(false)
    btnConfirmPhoto.prop('disabled', false)
})

mdlTakePhotoElement.on('show.bs.modal', e => {
    // On modal open, start recording
    photoshooter.start()
})

mdlTakePhotoElement.on('hide.bs.modal', e => {
    // On hide, stop recording
    photoshooter.stop()
})

document.addEventListener('DOMContentLoaded', async e => {
    reloadPhotos()
})