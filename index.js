const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");
const formRouter = require("./routes/form");
const workspaceRouter = require("./routes/workspace");
const responseRouter = require("./routes/response");

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use("/api/v1", indexRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/workspace", workspaceRouter);
app.use("/api/v1/form", formRouter);
app.use("/api/v1/response", responseRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  mongoose.connect(process.env.MONGOOSE_URI_STRING).then(() => {
    console.log("Connected to database");
  });
});
