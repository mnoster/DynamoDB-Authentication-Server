const path = require('path')
const http = require('http')
const helmet = require('helmet')
const express = require('express')
const bodyParser = require('body-parser')

// API Routes
const auth_router = require('./api/auth/webauth')

const app = express()

app.use(helmet())

app.use(bodyParser.json({limit: '5mb'}))
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}))

// Allowing CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    next()
})


// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')))


app.use(auth_router)



//Get port from environment and store in Express.
const port = process.env.PORT || '7788';
app.set('port', port)

// Create HTTP server
const server = http.createServer(app)

// Listen on this port, on all network interfaces
server.listen(port, () => console.log(`API running on localhost:${port}`));
