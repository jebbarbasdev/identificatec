//@ts-check

import { ProfileService } from '../services/ProfileService.js'
import { AuthService } from '../services/AuthService.js'
import { State } from '../utils/State.js'
import { $, DummyQuery } from '../utils/$.js'
import { snackDanger, snackSuccess } from '../utils/snacks.js'
import { Photoshooter } from '../utils/Photoshooter.js'
import { button } from '../utils/button.js'
import { swalQuestion } from '../utils/swals.js'

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

const imgProfilePicture = $('#imgProfilePicture')

/** @type {State<Photo[]>} */ //@ts-ignore
const photos = new State([])
photos.addChangeListener(newPhotos => {
    facesContainer.match.innerHTML = ''
    lblFacesQuantity.prop('textContent', newPhotos.length)
    
    const newCols = newPhotos.map(newPhoto => {
        const newCol = document.createElement('div')
        Object.assign(newCol, {
            className: 'col position-relative',
            innerHTML: `
                <img class="rounded w-100" alt="Image ${newPhoto.id}" src="${newPhoto.url}" />
                <div class="dropdown position-absolute" style="top: 0; right: 0;">
                    <button class="btn btn-link text-white" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                        </svg>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" data-trigger="set-profile-picture">Set As Profile Picture</a></li>
                        <li><a class="dropdown-item text-danger" href="#" data-trigger="delete-photo">Delete Picture</a></li>
                    </ul>
                </div>
            `
        })

        newCol.addEventListener('click', async e => {
            //@ts-ignore
            if (e.target?.matches('[data-trigger="set-profile-picture"]')) {
                const sure = await swalQuestion({ title: 'Set Profile Picture?', text: 'This image will be used as your profile picture' })
                if (sure) {
                    const data = await _profileService.setProfilePhoto(newPhoto.id)
                    if (data !== null) {
                        const photoUrl = data.photo_url
                        imgProfilePicture.prop('src', photoUrl)

                        snackSuccess('Profile picture set successfully')
                    }
                }   
            }

            //@ts-ignore
            if (e.target?.matches('[data-trigger="delete-photo"]')) {
                const sure = await swalQuestion({ title: 'Delete Photo?', text: 'This action will delete this photo and you will not longer login using it. If this photo is your profile picture it will be also removed' })
                if (sure) {
                    const data = await _profileService.deleteUserPhoto(newPhoto.id)
                    if (data !== null) {
                        const photoUrl = data.photo_url
                        imgProfilePicture.prop('src', photoUrl)

                        await reloadPhotos()
                        snackSuccess('Photo deleted successfully')
                    }
                }
            }
        })

        return newCol
    })
    
    facesContainer.match.append(...newCols)
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