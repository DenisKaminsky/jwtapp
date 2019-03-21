let jwt = require('jsonwebtoken');
const config = require('./config.js');

let createToken = (username) => {
	let token = jwt.sign({username: username}, config.secret, {expiresIn:'1m'});

	return token;
}

let checkToken = (req, res, next) => {
	//get auth header value
    const authHeader = req.headers["Cookie"];

    var token = req.cookies['jwt'];
    if (token) {
    	try{
    		jwt.verify(token,config.secret);
    		next();
    	}catch(err){
    		return res.sendStatus(401);
    	}     
    }else{
    	res.sendStatus(401);
    }
};

module.exports = {
  	checkToken: checkToken,
  	createToken: createToken
}