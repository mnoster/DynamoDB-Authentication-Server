const jwt = require('jsonwebtoken')
const config = require('../../config/secret.config.json')

function VerifyToken(req, res, next) {
  
  const token = req.headers['x-access-token']
  if (!token){
    return res.status(403).send({ auth: false, message: 'No token provided.' })
  }

  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
    }

    // If everything good, save to request for use in other routes
    let emailAndPass = decoded.id.split('|#%#|')

    req.email = emailAndPass[0]
    req.password = emailAndPass[1]

    next()
  })
}

module.exports = VerifyToken;