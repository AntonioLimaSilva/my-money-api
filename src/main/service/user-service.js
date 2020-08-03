const _ = require('lodash')
const bcrypt = require('bcrypt')
const User = require('../api/user')

const emailRegex = /\S+@\S+\.\S+/
const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,20})/

const signup = (req, res, next) => {
    const body = userRequest(req)
    const passwordHash = transformPasswordHash(body)

    const error = validate(body, passwordHash)
    if (error.hasErrors) {
        return res.status(400).send(error.fieldErrors)
    }

    const { email } = body

    User.findOne({ email })
        .then(userDB => {
            if (!userDB) {
                const newUser = new User({ ...body, password: passwordHash })
                newUser.save()
                    .then(result => {
                        return res.status(201).send({ message: 'Usuário cadastro com sucesso!' })
                    }).catch(err => {
                    return sendErrorsFromDB(res, err)
                })
            } else {
                res.status(400).send({errors: ['Usuário já cadastrado.']})
            }
        })
        .catch(err => {
            return sendErrorsFromDB(res, err)
        })
}

const findByEmail = (req, res, next) => {
    let email = req.query.email
    User.findOne({email}).then(result => {
        return res.status(200).send(result)
    }).catch(err => {
        return sendErrorsFromDB(res, err)
    })
}

const update = (req, res, next) => {
    const body = userRequest(req)
    const passwordHash = transformPasswordHash(body)

    const error = validate(body, passwordHash)
    if (error.hasErrors) {
        return res.status(400).send(error.fieldErrors)
    }

    User.findOneAndUpdate(req.params.id, { ...body, password: passwordHash },
        {new: true, useFindAndModify: false, runValidators: true})
        .then(result => {
            return res.status(200).send(result)
        }).catch(err => {
            return sendErrorsFromDB(res, err)
        });
}

const sendErrorsFromDB = (res, dbErrors) => {
    const errors = []
    _.forIn(dbErrors.errors, error => errors.push(error.message))
    return res.status(400).json({errors})
}

function userRequest(req) {
    const name = req.body.name || ''
    const email = req.body.email || ''
    const password = req.body.password || ''
    const confirmPassword = req.body.confirmPassword || ''

    return { name, email, password, confirmPassword }
}

function validate(request, passwordHash) {
    const error = {
        hasErrors: false,
        fieldErrors: {}
    }

    if (!request.email.match(emailRegex)) {
        error.hasErrors = true
        error.fieldErrors = {errors: ['O e-mail informado está inválido']}
    } else if (!request.password.match(passwordRegex)) {
        error.hasErrors = true
        error.fieldErrors = { errors: [
                "Senha precisar ter: uma letra maiúscula, uma letra minúscula, um número, " +
                "uma caractere especial(@#$ %) e tamanho entre 6-20."
            ]
        }
    } else if (!bcrypt.compareSync(request.confirmPassword, passwordHash)) {
        error.hasErrors = true
        error.fieldErrors = {errors: ['Senhas não conferem.']}
    }

    return error
}

function transformPasswordHash(request) {
    const salt = bcrypt.genSaltSync()
    return bcrypt.hashSync(request.password, salt)
}

module.exports = { signup, findByEmail, update }