const mongoose = require("mongoose");
const { model, Schema, SchemaTypes } = mongoose;
const { User } = require("./user.schema");

const fieldSchema = new Schema({
  label: String,
  placeholder: String,
  inputType: {
    type: String,
    enum: [
      "bubble",
      "image",
      "date",
      "text",
      "number",
      "email",
      "tel",
      "rating",
      "submit",
    ],
  },
});

const formSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  creator: {
    type: SchemaTypes.ObjectId,
    ref: User,
    required: true,
  },
  folderId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  views: { type: Number, default: 0 },
  fields: [fieldSchema],
});

const Form = new model("Form", formSchema);

module.exports = { Form };
