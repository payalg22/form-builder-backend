const mongoose = require("mongoose");
const { model, Schema, SchemaTypes } = mongoose;
const { Form } = require("./form.schema");

const responseSchema = new Schema({
  form: {
    type: SchemaTypes.ObjectId,
    ref: Form,
    required: true,
  },
  name: String,
  email: String,
  fields: [
    {
      label: String,
      value: String,
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const Response = new model("Response", responseSchema);

module.exports = { Response };
