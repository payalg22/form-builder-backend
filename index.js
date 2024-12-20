const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api/v1", indexRouter);
app.use("/api/v1/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  mongoose.connect(process.env.MONGOOSE_URI_STRING).then(() => {
    console.log("Connected to database");
  });
});
