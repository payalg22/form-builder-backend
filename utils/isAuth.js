function isAuth(userid, workspace) {
  const isShared = workspace.sharedTo.find(
    (item) => item.user.toString() === userid.toString()
  );
  const isOwner = workspace.owner.toString() === userid.toString();
  if(!isOwner && isShared === undefined){
    return false;
  }

  return isOwner ? true : isShared;
}

function isEditor(userid, workspace) {
  const isShared = workspace.sharedTo.find(
    (item) => item.user.toString() === userid.toString()
  );

  return isShared.isEditor;
}

module.exports = { isAuth, isEditor };
