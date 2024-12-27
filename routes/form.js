const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const verify = require("../middleware/auth");
const { Workspace } = require("../schemas/workspace.schema");
const { Form } = require("../schemas/form.schema");

//Get all the forms (only name) for specific folder
router.get("/folder/:id", verify, async (req, res) => {
  const { id } = req.params;

  try {
    const forms = await Form.find({ folderId: id }).select("name");
    if (!forms.length) {
      return res.status(404).json({
        message: "No forms to display",
      });
    }

    return res.status(200).json(forms);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

//Create a blank form
//Tested, works
router.post("/new", verify, async (req, res) => {
  const { user } = req;
  const { folderId, name, owner } = req.body;

  try {
    //If the owner is not the one creating the form, user id should be received
    const creator = new mongoose.Types.ObjectId(`${owner}`);
    const newId = new mongoose.Types.ObjectId(`${folderId}`);

    //Check if folder exists
    const isFolder = await Workspace.findOne(
      { "folders._id": newId },
      { "folders.$": 1 }
    );
    if (!isFolder) {
      return res.status(404).json({
        message: "Folder doesn't exists",
      });
    }

    //Check if form is already created
    const allForms = await Form.find({ folderId }).select("name");

    const isForm = allForms.find((form) => {
      return form.name.toLowerCase() === name.toLowerCase();
    });

    if (isForm) {
      return res.status(400).json({
        message: "Form already exists",
      });
    }

    const form = new Form({
      name: name.trim(),
      creator,
      folderId,
    });

    await form.save();

    return res.status(201).json({
      message: "Form created",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

//Edit a form -- add fields
router.patch("/edit/:id", verify, async (req, res) => {
  const { fields, name } = req.body;
  const { user } = req;
  const { id } = req.params;

  try {
    let form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    if (form.creator.toString() !== user) {
      return res.status(403).json({
        message: "You are not authorised to edit this form",
      });
    }

    if (name && name !== form.name) {
      form.name = name;
    }
    form.fields = fields;
    form.save();

    return res.status(201).json({
      message: "Form updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

//Get form-- modes(1.edit 2.view/respond)
router.get("/", async (req, res) => {
  const { mode, id } = req.query;
  try {
    let form = await Form.findById(id).select("name fields views");

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
      });
    }
    //Incrementing views
    if (mode === "view") {
      form.views += 1;
      form.save();
    }

    return res.status(200).json(form);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.delete("/:id", verify, async (req, res) => {
  const { id } = req.params;

  try {
    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
      });
    }
    await Form.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Form deleted successfully",
    });
  } catch (error) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.get("/analytics/:id", verify, async (req, res) => {});

module.exports = router;
