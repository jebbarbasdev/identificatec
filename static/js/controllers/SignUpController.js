//@ts-check

import { AuthService } from '../services/AuthService.js'
import { State } from '../utils/State.js'
import { $ } from '../utils/$.js'
import { snackDanger } from '../utils/snacks.js'

const bootstrap = globalThis.bootstrap

const _authService = new AuthService()

const txtFirstName = $('#txtFirstName')
const txtLastName = $('#txtLastName')
const txtEmail = $('#txtEmail')
const txtPassword = $('#txtPassword')
const txtCPassword = $('#txtCPassword')

const btnSignUp = $('#btnSignUp')

txtFirstName.on('keypress', e => {
    if (e.key === 'Enter') {
        txtLastName.match.focus()
    }
})

txtLastName.on('keypress', e => {
    if (e.key === 'Enter') {
        txtEmail.match.focus()
    }
})

txtEmail.on('keypress', e => {
    if (e.key === 'Enter') {
        txtPassword.match.focus()
    }
})

txtPassword.on('keypress', e => {
    if (e.key === 'Enter') {
        txtCPassword.match.focus()
    }
})

txtCPassword.on('keypress', e => {
    if (e.key === 'Enter') {
        btnSignUp.match.click()
    }
})

btnSignUp.on('click', async e => {
    const firstName = txtFirstName.val() + ''
    const lastName = txtLastName.val() + ''
    const email = txtEmail.val() + ''
    const password = txtPassword.val() + ''
    const cPassword = txtCPassword.val() + ''

    if (firstName.trim() === '') return snackDanger('Please provide your first name to continue')
    if (lastName.trim() === '') return snackDanger('Please provide your last name to continue')
    if (email.trim() === '') return snackDanger('Please provide your email to continue')
    if (email.trim() === '') return snackDanger('Please provide your email to continue')
    if (password === '') return snackDanger('Please provide your password to continue')
    if (cPassword !== password) return snackDanger('Passwords do not match')

    btnSignUp.prop('disabled', true)

    const data = await _authService.signUp(firstName, lastName, email, password)
    if (data !== null) {
        window.location.href = data.redirect_url
    }

    btnSignUp.prop('disabled', false)
})