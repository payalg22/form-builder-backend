const mongoose = require("mongoose");

const isValidId = (req, res, next) => {
  const { id } = req.params;
  const isValid = mongoose.isValidObjectId(id);
  if (!isValid) {
    return res.status(400).json({
      message: "Invalid form Id",
    });
  }
  next();
};
