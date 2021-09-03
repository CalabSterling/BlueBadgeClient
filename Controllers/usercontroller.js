let express = require('express');
let router = express.Router();
let user = require('../db').import('../models/user');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
 
router.post('/signup', function (req, res)
{
    user.create({
        username: req.body.user.username,
        password: bcrypt.hashSync(req.body.user.password, 13)
    })
    .then(
        function signupSuccess(user) {
            let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {expiresIn: 60 * 60 * 24});
 
            res.json({
                user: user,
                message: 'Yay! New user!',
                sessionToken: token
            });
        }
    )
    .catch(err => res.status(500).json({ error: err }))
});
 
router.post('/login', function(req, res) {
 
    user.findOne(
        {where:{
            username: req.body.user.username
        }
    })
    .then(function loginSuccess(user) {
        if (user) {
            bcrypt.compare(req.body.user.password, user.password, function (err, matches) {
            if (matches) {
 
                let token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: 60 * 60 * 24})
                res.status(200).json({
                    user: user,
                    message: "Yay! Logged in!",
                    sessionToken: token
                })
            }else{
                res.status(502).send({ error: 'Login Failed' });
            } 
            }); 
        } else {
            res.status(500).json({ error: "User does not exist."})
        }
    })
    .catch(err => res.status(500).json({ error: err }))
});
 
module.exports = router