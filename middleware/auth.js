const jwtWafi = require("jsonwebtoken");

const authenticateWafi = (reqWafi, resWafi, nextWafi) => {
    // Check for token in cookies first, then in Authorization header
    const tokenWafi = reqWafi.cookies.token || 
                 (reqWafi.headers.authorization && reqWafi.headers.authorization.startsWith('Bearer ') 
                  ? reqWafi.headers.authorization.split(' ')[1] 
                  : null);
    
    console.log("Auth middleware - Cookies:", reqWafi.cookies);
    
    if (!tokenWafi) {
        console.error("No token provided for", reqWafi.method, reqWafi.originalUrl);
        return resWafi.status(401).json({ error: "Unauthorized. Token missing." });
    }
    
    try {
        const decodedWafi = jwtWafi.verify(tokenWafi, process.env.JWT_SECRET_WAFI);
        reqWafi.user = decodedWafi;
        console.log("Token decoded successfully for", reqWafi.method, reqWafi.originalUrl);
        nextWafi();
    } catch (errorWafi) {
        console.error("Token verification error:", errorWafi);
        return resWafi.status(401).json({ error: "Unauthorized. Invalid token." });
    }
};

module.exports = authenticateWafi;
