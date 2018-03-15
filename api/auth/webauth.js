const AWS = require("aws-sdk")
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const VerifyToken = require("./VerifyToken")
const settings = require('../../config/connect.config.json')
const config = require('../../config/secret.config.json')

AWS.config = settings
const bodyParser = require('body-parser')


router.use(bodyParser.urlencoded({
    extended: true
}))

router.use(bodyParser.json())
const dynamodb = new AWS.DynamoDB.DocumentClient()
// let dynamodb = new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:7778') });

const _api = {

    authenticate_user: (req,res) => {
        try{
            dynamodb.query(FormattedQueryUserData(req.body), function(err,item) {
                if(item) {
                    const is_valid = bcrypt.compareSync(req.body.password, item.Items[0].password)
                    if (item.Count > 0 && is_valid) {
                        const token = jwt.sign(
                            { 
                                id: `${req.body.email}|#%#|${req.body.password}`
                            }, 
                            config.secret, 
                            {
                                expiresIn: 86400 // expires in 24 hours
                            }
                        )
                        res.status(200).send({message: "User Authenticated", auth: true, token: token})
                    } else {
                        res.status(403).send({message: "Email or password is incorrect.", auth: false})
                    }
                } else  res.status(400).send({message: "Format Error", auth: false})
            })
        }catch(err){
            RequestError(res)
        }
    },

    create_user: (req,res) => {
        try{
            if(!CheckUserProperties(req.body)){ 
                res.status(406).send({message: "User Property(s) missing or empty"})
                return
            }
            dynamodb.query(FormattedQueryUserData(req.body), function(none,item) {
                if(item && item.Count < 1){
                    dynamodb.put(FormattedCreateUserData(req.body), function(err,data) {
                        if(err) res.send(err)
                        if(data) res.status(200).send({message: 'User Created Successfully', auth: true})
                    })
                }else{
                    res.status(475).send({message: "Already an account with this email"})
                }
            })
        } catch(err){
            RequestError(res)
        }
    },

    get_user: (req,res) => {
        try{
            dynamodb.query(FormattedQueryUserData(req.body), function(err,item) {
                if(item) {
                    if (item.Count) {
                        delete item.Items[0].password
                        res.status(200).send({message:"Retrieved User", user: item.Items[0]})
                    } else {
                        res.status(403).send({message: "Could not find user"})
                    }
                } else  {
                    res.status(502).send({message: "Format Error"})
                }
            })
        }catch(err){
            RequestError(res)
        }
    },

    update_user: (req,res) => {
        try{
            dynamodb.put(FormattedCreateUserData(req.body), function(err,data) {
                if(err) res.send({message:"Update Failed: " + err})
                if(data) res.status(200).send({message: "Update Success", auth: true});
            })
        }catch(err){
            RequestError(res)
        }
    },

    delete_user: (req,res) => {
        try{
            dynamodb.deleteItem(req, function (err, data) {
                if(err) res.send(err);
                if(data) res.send(data);
            })
        }catch(err){
            RequestError(res)
        }
    },

    logout: (req,res) => {
        try{
            res.status(200).send({message:'User Logged Out', auth: false, token: null })
        }catch(err){
            RequestError(res)
        }
    }
}

/* 
 * ----------------------------------------
 * Functional utils for building out request.
 * Formatting for queries, validation, & error handling.
 * ----------------------------------------
*/

let date = new Date()

const FormattedQueryUserData = (req) => {
    let user = {};
    user.TableName = "Users";
    user.Limit = 1;
    user.KeyConditionExpression = '#email = :email';
    user.ExpressionAttributeNames ={"#email": "email"};
    user.ExpressionAttributeValues = {':email' : req.email}
    return user;
}

const FormattedCreateUserData = (req) => {
    let create_user = {}
    req.date = date.toDateString()
    req.email = req.email.toLowerCase().trim()
    req.password = bcrypt.hashSync(req.password, 8)
    create_user.TableName = "Users"
    create_user.Item = req
    return create_user
}

const CheckUserProperties = (user) => {
    if(!user){
        return false
    }
    if(!user.email && !user.first_name && !user.last_name){
        return false
    }
    return true
} 

const RequestError = (res) => {
    res.status(400).send({message: "Error with your request"})
}

// Route Assignment

router.post("/user/auth", _api.authenticate_user)
router.post("/user/get", VerifyToken, _api.get_user)
router.post("/user/create", _api.create_user)
router.put("/user/update", VerifyToken, _api.update_user)
router.delete("/user/delete", VerifyToken, _api.delete_user)

module.exports = router;