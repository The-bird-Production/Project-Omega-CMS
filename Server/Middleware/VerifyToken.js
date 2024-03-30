const jwt = require("jsonwebtoken");
const config = require("../config/session");

const accessTokenSecret = config.token_key;

const verifyJWTToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, accessTokenSecret, (err) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ code: "401", message: "Expired token" });
        }
        return res.status(403).json({ code: "403", message: "Invalid token" });
      }
      next();
    });
  } else {
    res.status(403).json({ code: "403", message: "No token provided" });
  }
};

exports.verifyJWTToken = verifyJWTToken;
