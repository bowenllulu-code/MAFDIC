import type { CurrentUser, PageId, Permission, UserRole } from "./domain";

const basePages: PageId[] = ["workspace", "customers", "transactions", "performance", "opportunities", "assistant"];
const allPages: PageId[] = ["workspace", "customers", "transactions", "risks", "performance", "configs", "opportunities", "assistant", "integration"];

const rolePermissions: Record<UserRole, Permission[]> = {
  运营岗: [
    ...basePages.map((page) => `view:${page}` as const),
    "view:risks",
    "operate:queue",
    "execute:ai",
  ],
  清算岗: [
    "view:workspace",
    "view:customers",
    "view:transactions",
    "view:risks",
    "view:assistant",
    "operate:queue",
    "approve:operation",
    "execute:ai",
  ],
  配置岗: [
    "view:workspace",
    "view:customers",
    "view:configs",
    "view:risks",
    "view:assistant",
    "operate:queue",
    "edit:config",
    "approve:config",
    "execute:ai",
  ],
  风控岗: [
    "view:workspace",
    "view:customers",
    "view:transactions",
    "view:risks",
    "view:assistant",
    "operate:queue",
    "approve:operation",
    "execute:ai",
  ],
  管理者: [
    "view:workspace",
    "view:customers",
    "view:transactions",
    "view:risks",
    "view:performance",
    "view:opportunities",
    "view:assistant",
    "view:integration",
    "view:all-data",
    "execute:ai",
  ],
  系统管理员: [
    ...allPages.map((page) => `view:${page}` as const),
    "operate:queue",
    "approve:operation",
    "edit:config",
    "approve:config",
    "execute:ai",
    "view:all-data",
  ],
};

const roleScope: Record<UserRole, CurrentUser["dataScope"]> = {
  运营岗: "所属团队",
  清算岗: "全机构",
  配置岗: "全机构",
  风控岗: "全机构",
  管理者: "全机构",
  系统管理员: "全系统",
};

export const roles = Object.keys(rolePermissions) as UserRole[];

export function buildUser(role: UserRole): CurrentUser {
  return {
    id: `USER-${role}`,
    name: role === "管理者" ? "沈知远" : role === "系统管理员" ? "系统管理员" : `${role}用户`,
    role,
    dataScope: roleScope[role],
    permissions: rolePermissions[role],
  };
}

export function can(user: CurrentUser, permission: Permission) {
  return user.permissions.includes(permission);
}

export function canView(user: CurrentUser, page: PageId) {
  return can(user, `view:${page}`);
}
