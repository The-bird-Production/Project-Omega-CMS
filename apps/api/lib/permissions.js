import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
    ...defaultStatements,
  administration: [
    "viewDashboard",
    "createArticle",
    "deleteArticle",
    "editArticle",
    "deletePage",
    "createPage",
    "editPage",
    "removeLogs",
    "viewLogs",
    "installPlugin",
    "removePlugin",
    "installTheme",
    "removeTheme",
    "createRedirect",
    "removeRedirect",
    "editRedirect",
    "createRole",
    "deleteRole",
    "editRole",
    "viewStats",
    "createImage",
    "removeImage",
    "editImage"
  ],
};

export const ac = createAccessControl(statement);
export const user = ac.newRole()
export const admin = ac.newRole({
    administration: [
        "viewDashboard",
        "createArticle",
        "deleteArticle",
        "editArticle",
        "deletePage",
        "createPage",
        "editPage",
        "removeLogs",
        "viewLogs",
        "installPlugin",
        "removePlugin",
        "installTheme",
        "removeTheme",
        "createRedirect",
        "removeRedirect",
        "editRedirect",
        "createRole",
        "deleteRole",
        "editRole",
        "viewStats",
        "createImage",
        "removeImage",
        "editImage"
    ],
    ...adminAc.statements,
})