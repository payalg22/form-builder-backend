const jwt = require("jsonwebtoken");

const validate = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        message: "Please login and try again",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();

  } catch (error) {
    return res.status(401).json({
        message: "Please login and try again",
    });
  }
};

module.exports = validate;
