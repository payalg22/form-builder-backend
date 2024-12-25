const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const verify = require("../middleware/auth");
const { Form } = require("../schemas/form.schema");
const { Response } = require("../schemas/response.schema");

//TODO: test all
router.get("/form/:id", verify, async (req, res) => {
  const { id } = req.params;
  const formId = new mongoose.Types.ObjectId(`${id}`);
  try {
    const responses = await Response.find({ form: formId }).select("-__v");
    const form = await Form.finById(formId);

    if (!responses.length()) {
      return res.status(404).json({
        message: "No responses found",
      });
    }

    const starts = responses.length();
    const totalFields = form.fields.length();
    const completedRes = responses.filter((response) => {
      return response.fields.length() === totalFields;
    });
    const completed = completedRes.length();

    return res.status(200).json({
      responses,
      starts,
      completed,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.post("/new/:form", async (req, res) => {
  const { form } = req.params;
  const { name, email } = req.body;
  try {
    const isForm = await Form.findById(form);

    if (!isForm) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    const response = new Response({
      form: isForm._id,
      name,
      email,
      submittedAt: new Date(),
    });
    const newResponse = await response.save();

    return res.status(201).json({ id: newResponse._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { field } = req.body;
  try {
    let response = await Form.findById(id);

    if (!Response) {
      return res.status(404).json({
        message: "Response not added",
      });
    }

    response.fields.push(field);
    response.submittedAt = new Date();
    const newResponse = await response.save();

    return res.status(201).json(newResponse);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

module.exports = router;
