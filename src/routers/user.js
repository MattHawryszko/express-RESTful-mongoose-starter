const express = require('express')
const User = require('../models/user')
const Auth = require('../middleware/auth')
const router = new express.Router()

router.post('/api/users', async (req, res) => {
    const user = new User(req.body)
    
    try {
        const token = await user.generateJWT()
        await user.save()
        res.status(201).send({user, token})
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/api/users/login', async (req, res) => {
    

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateJWT()
        res.send({user, token})
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})
router.post('/api/users/logout',Auth , async (req, res) => {
    try {  
        req.user.tokens = req.user.tokens.filter((token) =>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})
router.post('/api/users/logoutAll',Auth , async (req, res) => {
    try {  
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/api/users', Auth, async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }
})
router.get('/api/users/me', Auth, async (req, res) => {
    try {
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/api/users/:id',Auth , async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/api/users/:id',Auth , async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = await User.findById(req.params.id)
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/api/users/:id', Auth,async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router