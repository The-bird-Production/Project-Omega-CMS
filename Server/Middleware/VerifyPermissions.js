const GetPermissionByRoleId = require("../Functions/GetPermissionByroleId");
const jwt = require("jsonwebtoken");

const VerifyPermission = (permission) => {
  return async function (req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader.split(" ")[1];
      const decode = jwt.decode(token);
      const { permissions } = await GetPermissionByRoleId(decode.user.roleId);
      
      if (permissions["admin"] || permissions[permission]) {
        next();
      } else {
        res.status(403).json({ code: 403, message: "Forbidden " });
      }
    } catch (e) {
      console.log(e)
      return res
        .status(500)
        .json({ code: 500, message: "Internal Server Error: " + e });
    }
  };
};

module.exports = VerifyPermission;
