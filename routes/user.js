const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../schemas/user.schema");
const verify = require("../middleware/auth");
const { Workspace } = require("../schemas/workspace.schema");
const isValidId = require("../middleware/validate");

//REGISTER ROUTE
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
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

    const workspace = new Workspace({
      owner: response._id,
      folders: [{ name: response._id.toString() }],
    });
    await workspace.save();
    //Creating token
    const payload = { id: response._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return res.status(201).json({
      message: "User created successfully",
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

//LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

//UPDATE USER ROUTE
router.put("/update", verify, async (req, res) => {
  const { name, email, oldPassword, newPassword } = req.body;
  const { user } = req;
  try {
    var userData = await User.findById(user);
    if (!userData) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let data = { name, email };
    if (newPassword) {
      const isValidPass = await bcrypt.compare(oldPassword, userData.password);
      if (!isValidPass) {
        return res.status(401).json({
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
    const response = await User.findByIdAndUpdate(user, data, {
      new: true,
      select: "name email",
    });

    return res.status(201).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

//GET USER DETAILS
router.get("/", verify, async (req, res) => {
  const { user } = req;
  try {
    const userInfo = await User.findById(user).select(
      "-password -__v -createdAt"
    );
    if (!userInfo) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    return res.status(200).json(userInfo);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

//CHECK IF USER EXISTS
router.get("/isuser/:id", isValidId, async (req, res) => {
  const { id } = req.params;
  const isUser = await User.findById(id);

  try {
    if (!isUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

//CHANGE THEME
router.put("/theme/:theme", verify, async (req, res) => {
  const { user } = req;
  const { theme } = req.params;

  try {
    let userInfo = await User.findById(user).select(
      "-password -createdAt -__v"
    );
    if (!userInfo) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    userInfo.isDarkTheme = theme === "true" ? true : false;
    userInfo = await userInfo.save();

    return res.status(200).json(userInfo);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

module.exports = router;
