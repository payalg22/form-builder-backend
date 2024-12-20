const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const verify = require("../middleware/auth");
const { Workspace } = require("../schemas/workspace.schema");
const { isAuth, isEditor } = require("../utils/isAuth");

//GET WORKSPACE LIST FOR A USER
//working, tested for all
router.get("/", verify, async (req, res) => {
  const { user } = req;
  const id = new mongoose.Types.ObjectId(user);

  let workspaces = await Workspace.find({
    $or: [{ owner: id }, { "sharedTo.user": id }],
  })
    .select("owner")
    .populate({
      path: "owner",
      select: "name",
    });
  workspaces = workspaces.map((item) => {
    return { _id: item._id, owner: item.owner.name };
  });

  return res.json(workspaces);
});

//GET A PARTICULAR WORKSPACE : folder list
//Working, tested
router.get("/data/:id", verify, async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  let workspace = await Workspace.findById(id).select("-__v");
  if (!workspace) {
    return res.status(404).json({
      message: "Workspace not found",
    });
  }

  const isAuthUser = isAuth(user, workspace);
  if (!isAuthUser) {
    return res.status(403).json({
      message: "You're not authorised to view this workspace",
    });
  }

  workspace.sharedTo = workspace.sharedTo.find(
    (item) => item.user.toString() === user
  );

  return res.status(200).json(workspace);
});

//SHARE WORKSPACE
//tested, working p.s.- just check other case
router.post("/share/:id", verify, async (req, res) => {
  const { owner, recepient, isEditor } = req.body;
  const { id } = req.params;

  let workspace = await Workspace.findById(id);
  if (!workspace) {
    return res.status(404).json({
      message: "Workspace not found",
    });
  }
  //TODO: check if owner or recepient is sharing the workspace
  //if recepient can share the workspace, then use isAuth() and then remove lines 22 to 24, so owner id chan be shared
  //no need to get owner, just get user from req and check
  if (workspace.owner.toString() !== owner) {
    return res.status(403).json({
      message: "You're not authorised to share this workspace",
    });
  }

  const isMember = workspace.sharedTo.findIndex(
    (person) => person.user.toString() === recepient
  );
  //Check if workspace is already shared
  if (isMember !== -1) {
    //if the access type has changed, then update
    if (workspace.sharedTo[isMember].isEditor.toString() == isEditor) {
      return res.status(400).json({
        message: "User already added",
      });
    }
    workspace.sharedTo[isMember].isEditor = isEditor;
    await workspace.save();
    return res.status(201).json({
      message: "Workspace shared successfully",
    });
  }
  //adding the member to sharedTo array
  const member = { user: new mongoose.Types.ObjectId(recepient), isEditor };
  workspace.sharedTo.push(member);
  await workspace.save();

  return res.status(201).json({
    message: "Workspace shared successfully",
  });
});

//CREATE A NEW FOLDER
//working, tested for all
router.post("/folder/new", verify, async (req, res) => {
  const { workspace, foldername } = req.body;
  const { user } = req;

  let data = await Workspace.findById(workspace);

  const isAuthUser = isAuth(user, data);

  //check if user is authorised to edit
  if (!isAuthUser || !isAuthUser.isEditor) {
    return res.status(403).json({
      message: "You're not authorised to edit this workspace",
    });
  }

  const isFolder = data.folders.findIndex(
    (item) => item.name.toLowerCase() === foldername.toLowerCase()
  );
  if (isFolder !== -1) {
    return res.status(400).json({
      message: "Folder already exists",
    });
  }

  data.folders.push({ name: foldername });
  await data.save();

  return res.status(201).json({
    message: "Folder created successfully",
  });
});

//DELETE A FOLDER
router.delete("/folder/:workspace/:folder", verify, async (req, res) => {
  const { user } = req;
  const { workspace, folder } = req.params;

  let data = await Workspace.findById(workspace);

  const isAuthUser = isAuth(user, data);
  //check if user is authorised to edit
  if (!isAuthUser || !isAuthUser.isEditor) {
    return res.status(403).json({
      message: "You're not authorised to edit this workspace",
    });
  }
//check if folder exists
  const isFolder = data.folders.findIndex(
    (item) => item._id.toString() === folder
  );
  if (isFolder === -1) {
    return res.status(404).json({
      message: "Folder doesn't exists",
    });
  }

  data.folders.splice(isFolder, 1);
  await data.save();

  return res.status(201).json({
    message: "Folder deleted successfully",
  });
});

//GET A SPECIFIC FOLDER FOR USER -- let's try n move this to form routes to
//directly fetch forms using folder id
// router.get("/folder/:id", verify, async(req, res) => {
//     const {id} = req.params;

// })

module.exports = router;
