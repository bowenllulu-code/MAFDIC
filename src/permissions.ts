import type { CurrentUser, PageId, Permission, UserRole } from "./domain";

const salesManagerPages: PageId[] = ["workspace", "customers", "transactions", "performance", "opportunities", "assistant"];
export const allPages: PageId[] = ["workspace", "customers", "transactions", "risks", "performance", "configs", "opportunities", "assistant", "integration", "users"];

const businessManagementPages: PageId[] = allPages;
const businessManagementBasePermissions: Permission[] = [
  ...allPages.map((page) => `view:${page}` as const),
  "operate:queue",
  "approve:operation",
  "edit:config",
  "approve:config",
  "execute:ai",
  "view:all-data",
  "manage:users",
];

const rolePermissions: Record<UserRole, Permission[]> = {
  运营: [
    ...businessManagementBasePermissions,
    "create:user",
    "edit:user",
  ],
  销售经理: [
    ...salesManagerPages.map((page) => `view:${page}` as const),
    "execute:ai",
  ],
  销售总监: [
    ...businessManagementPages.map((page) => `view:${page}` as const),
    "execute:ai",
    "view:all-data",
    "manage:users",
    "edit:user",
  ],
  业务主管: [
    ...businessManagementBasePermissions,
    "create:user",
    "edit:user",
    "delete:user",
  ],
};

export const roleScope: Record<UserRole, CurrentUser["dataScope"]> = {
  运营: "全机构",
  销售经理: "关联客户与商机",
  销售总监: "全机构",
  业务主管: "全机构",
};

export const roles = Object.keys(rolePermissions) as UserRole[];

export function getRolePermissions(role: UserRole) {
  return rolePermissions[role];
}

export function buildUser(role: UserRole): CurrentUser {
  return {
    id: `USER-${role}`,
    name: role === "销售经理" ? "陈明" : role === "销售总监" ? "沈知远" : role === "业务主管" ? "周岚" : "运营用户",
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
