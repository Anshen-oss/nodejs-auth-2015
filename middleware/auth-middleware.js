const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Traitement de la requête
    const authHeader = req.headers.authorization;

    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided! Please login to continue'
        });
    }
// decode this token
   try {
       const decodedTokenInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
       console.log(decodedTokenInfo);
       // add the user info in the request
       req.userInfo = decodedTokenInfo;
       next()
   } catch(err) {
       return res.status(500).json({
           success: false,
           message: 'Acces denied. No token provided! Please login to continue'
       });
   }

}

module.exports = authMiddleware;