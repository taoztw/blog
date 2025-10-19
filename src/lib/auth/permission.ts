import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  project: ["create", "update", "delete", "list"],
  user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password", "get", "update"],
  session: ["list", "revoke", "delete"],
};

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  project: ["list"],
});

export const admin = ac.newRole(statement);
