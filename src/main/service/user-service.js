const _ = require('lodash')
const bcrypt = require('bcrypt')
const User = require('../api/user')

const emailRegex = /\S+@\S+\.\S+/
const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,20})/

const signup = (req, res, next) => {
    const request = values(req)

    if (!request.email.match(emailRegex)) {
        return res.status(400).send({ errors: ['O e-mail informado está inválido'] })
    }

    if (!request.password.match(passwordRegex)) {
        return res.status(400).send({
            errors: [
                "Senha precisar ter: uma letra maiúscula, uma letra minúscula, um número, uma caractere especial(@#$ %) e tamanho entre 6-20."
            ]
        })
    }

    const salt = bcrypt.genSaltSync()
    const passwordHash = bcrypt.hashSync(request.password, salt)

    if (!bcrypt.compareSync(request.confirmPassword, passwordHash)) {
        return res.status(400).send({ errors: ['Senhas não conferem.'] })
    }

    const { email } = request

    User.findOne({ email }, (err, user) => {
        if (err) {
            return sendErrorsFromDB(res, err)
        } else if (user) {
            return res.status(400).send({ errors: ['Usuário já cadastrado.'] })
        } else {
            const newUser = new User({ ...request, password: passwordHash })
            newUser.save(err => {
                if (err) {
                    return sendErrorsFromDB(res, err)
                } else {
                    res.status(201).send({ message: 'Usuário cadastro com sucesso!' })
                }
            })
        }
    })
}

const findByEmail = (req, res, next) => {
    let email = req.query.email
    User.findOne({ email }, (err, result) => {
        if(err) {
            return sendErrorsFromDB(res, err)
        } else {
            return res.status(200).send(result)
        }
    })
}

const update = (req, res, next) => {
    const request = values(req)
    console.log('REQUEST: ', request)

    if (!request.email.match(emailRegex)) {
        return res.status(400).send({ errors: ['O e-mail informado está inválido'] })
    }

    if (!request.password.match(passwordRegex)) {
        return res.status(400).send({
            errors: [
                "Senha precisar ter: uma letra maiúscula, uma letra minúscula, um número, uma caractere especial(@#$ %) e tamanho entre 6-20."
            ]
        })
    }

    const salt = bcrypt.genSaltSync()
    const passwordHash = bcrypt.hashSync(request.password, salt)

    if (!bcrypt.compareSync(request.confirmPassword, passwordHash)) {
        return res.status(400).send({ errors: ['Senhas não conferem.'] })
    }

    User.findOneAndUpdate(req.params.id, { ...request, password: passwordHash }, (err, result) => {
        if (err) {
            return sendErrorsFromDB(res, err)
        } else {
            return res.status(201).send(result);
        }
    });
}

const sendErrorsFromDB = (res, dbErrors) => {
    const errors = []
    _.forIn(dbErrors.errors, error => errors.push(error.message))
    return res.status(400).json({ errors })
}

function values(req) {
    const name = req.body.name || ''
    const email = req.body.email || ''
    const password = req.body.password || ''
    const confirmPassword = req.body.confirm_password || ''

    return { name, email, password, confirmPassword }
}

module.exports = { signup, findByEmail, update }