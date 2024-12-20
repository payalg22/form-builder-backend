const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../schemas/user.schema");
const verify = require("../middleware/auth");

//REGISTER ROUTE
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const isUser = await User.findOne({ email });

  if (isUser) {
    return res.status(400).json({
      message: "User already exists. Please login",
    });
  }

  const hashedPass = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPass,
  });

  const response = await user.save();

  return res.status(201).json({
    message: "User created successfully",
    id: response._id,
  });
});

//LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const isUser = await User.findOne({ email });
  if (!isUser) {
    return res.status(404).json({
      message: "Invalid username or password",
    });
  }

  const isValidPass = await bcrypt.compare(password, isUser.password);
  if (!isValidPass) {
    return res.status(400).json({
      message: "Invalid username or password",
    });
  }

  const payload = { id: isUser._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  return res.status(200).json({
    message: "User logged in successfully",
    token,
  });
});

//UPDATE ROUTE
router.put("/update", verify, async (req, res) => {
  const { name, email, oldPassword, newPassword } = req.body;
  const { user } = req;

  var userData = await User.findById(user);

  if (!userData) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  var data = { name, email };

  if (newPassword) {
    const isValidPass = await bcrypt.compare(oldPassword, userData.password);
    if (!isValidPass) {
      return res.status(400).json({
        message: "Invalid password, please try again",
      });
    }
    const isSamePass = await bcrypt.compare(newPassword, userData.password);
    if (isSamePass) {
      return res.status(400).json({
        message: "New password cannot be same as old password",
      });
    }
    const hashedPass = await bcrypt.hash(newPassword, 10);
    data = {
      ...data,
      password: hashedPass,
    };
  }

  const response = await User.findByIdAndUpdate(user, data, { new: true });

  return res.status(201).json({
    message: "User details updated successfully",
  });
});

//GET USER DETAILS
router.get("/", verify, async (req, res) => {
  const { user } = req;

  const userInfo = await User.findById(user).select("-password -__v");

  if (!userInfo) {
    return res.status(404).json({
      message: "user not found",
    });
  }

  return res.status(200).json(userInfo);
});

//GET ALL USERS
router.get("/all", async (req, res) => {
  const users = await User.find();

  return res.status(200).json(users);
});

//CHECK IF USER EXISTS
router.get("/isuser/:id", async (req, res) => {
  const { id } = req.params;
  const isUser = await User.findById(id);

  if (!isUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200);
});

module.exports = router;
