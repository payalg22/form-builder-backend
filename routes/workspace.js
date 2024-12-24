const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const verify = require("../middleware/auth");
const { Workspace } = require("../schemas/workspace.schema");
const { isAuth, isEditor } = require("../utils/isAuth");
const { User } = require("../schemas/user.schema");

//GET WORKSPACE LIST FOR A USER
//working, tested for all
router.get("/", verify, async (req, res) => {
  const { user } = req;
  const id = new mongoose.Types.ObjectId(`${user}`);

  let workspaces = await Workspace.find({
    $or: [{ owner: id }, { "sharedTo.user": id }],
  })
    .select("owner")
    .populate({
      path: "owner",
      select: "name",
    });
  //   workspaces = workspaces.map((item) => {
  //     return { _id: item._id, owner: item.owner.name };
  //   });
  if (workspaces.length === 0) {
    const workspace = new Workspace({
      owner: id,
      folders: [{ name: user.toString() }],
    });
    await workspace.save();
    workspaces = [workspace];
  }

  return res.json(workspaces);
});

//GET A PARTICULAR WORKSPACE : folder list
//Working, tested
router.get("/data/:id", verify, async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  try {
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
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
});

//SHARE WORKSPACE
//tested, working
router.patch("/share/:id", verify, async (req, res) => {
  const { email, isEditor } = req.body;
  const { id } = req.params;
  try {
    let recepient = await User.findOne({ email }).select("_id email");
    if (!recepient) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    //   if (workspace.owner.toString() !== owner) {
    //     return res.status(403).json({
    //       message: "You're not authorised to share this workspace",
    //     });
    //   }

    const isMember = workspace.sharedTo.findIndex(
      (person) => person.user.toString() === recepient._id.toString()
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
      return res.status(200).json({
        message: "Workspace shared successfully",
      });
    }
    //adding the member to sharedTo array
    const member = { user: recepient._id, isEditor };
    workspace.sharedTo.push(member);
    await workspace.save();

    return res.status(200).json({
      message: "Workspace shared successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
});

//CREATE A NEW FOLDER
//working, tested for all
router.post("/folder/new", verify, async (req, res) => {
  const { workspace, foldername } = req.body;
  const { user } = req;

  let data = await Workspace.findById(workspace);

  if (!workspace) {
    return res.status(404).json({
      message: "Workspace not found",
    });
  }

  const isAuthUser = isAuth(user, data);

  //check if user is authorised to edit
  if (!isAuthUser && !isAuthUser.isEditor) {
    return res.status(403).json({
      message: "You're not authorised to edit this workspace",
    });
  }

  const isFolder = data.folders.findIndex(
    (item) => item.name.trim().toLowerCase() === foldername.toLowerCase().trim()
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
  if (!isAuthUser && !isAuthUser.isEditor) {
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
