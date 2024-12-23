const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isDarkTheme: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: "Date",
    default: Date.now,
  },
});

const User = new model("User", userSchema);

module.exports = { User };
