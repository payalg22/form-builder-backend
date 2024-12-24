const mongoose = require("mongoose");
const { model, Schema, SchemaTypes } = mongoose;
const { User } = require("./user.schema");
const { Form } = require("./form.schema");

const folderSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

const sharedSchema = new Schema({
  user: {
    type: SchemaTypes.ObjectId,
    ref: User,
  },
  isEditor: {
    type: Boolean,
    default: false,
  },
});

const workspaceSchema = new Schema({
  owner: {
    type: SchemaTypes.ObjectId,
    ref: User,
    required: true,
  },
  sharedTo: [sharedSchema],
  folders: [folderSchema],
});

workspaceSchema.index({ _id: 1, "folders.name": 1 }, { unique: true });

const Workspace = new model("Workspace", workspaceSchema);

module.exports = { Workspace };
