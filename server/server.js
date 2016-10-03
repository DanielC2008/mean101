'use strict'

const { json } = require('body-parser')
const { Server } = require('http')
const express = require('express')
const mongoose = require('mongoose')
const socketio = require('socket.io')

const app = express()
//create a server that wraps around app to listen for websockets bc express cant do this
const server = Server(app)
//pass this new server to the socket.io
const io = socketio(server)

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/meanchat'
const PORT = process.env.PORT || 3000

app.use(express.static('client'))
app.use(json())


app.get('/api/title', (req,res) => {
	res.json({ title: 'MEAN Chat'})
})

const Message = mongoose.model('message', {
	author: String,
	content: String
})

app.get('/api/messages', (req, res, err) =>
	Message
	.find()
	.then(messages => res.json({ messages }))
	.catch(err)
)

app.post('/api/messages',(req, res, err) => {
	const msg = req.body
	Message
		.create(msg)
		.then( msg => res.send({msg}))
		.catch(err)
})


mongoose.Promise = Promise
mongoose.connect(MONGODB_URL, () =>
	server.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
)


io.on('connection', socket => {
	console.log(`Socket connected: ${socket.id}`)
	socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`))
})
