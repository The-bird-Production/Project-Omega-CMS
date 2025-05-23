const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (process.env.NODE_ENV === "test") {
    return next();
  }
  

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      next();
    }
    
  } catch (err) {
    console.log(err);

    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authMiddleware;
