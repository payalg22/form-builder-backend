const mongoose = require("mongoose");

const isValidId = (req, res, next) => {
  const { id } = req.params;
  //const isValid = mongoose.isValidObjectId(id);
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) {
    return res.status(400).json({
      message: "Invalid ObjectId",
    });
  }
  next();
};

module.exports = isValidId;
