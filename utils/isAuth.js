function isAuth(userid, workspace) {
  const isShared = workspace.sharedTo.find(
    (item) => item.user.toString() === userid.toString()
  );
  const isOwner = workspace.owner.toString() === userid.toString();

  if (!isOwner && isShared === undefined) {
    return false;
  }

  return isOwner ? true : isShared;
}

module.exports = { isAuth };
