export const ALL_PERMISSION = [
  // roles
  "role:create",
  "role:edit",
  "role:delete",
  "role:read",

  // users
  "user:create",
  "user:read",
  "user:update",
  "user:delete",

  // user roles
  "user:role:assign",
  "user:role:update",
  "user:role:delete",
] as const;

export const PERMISSION = ALL_PERMISSION.reduce((acc, permission) => {
  acc[permission] = permission;

  return acc;
}, {} as Record<(typeof ALL_PERMISSION)[number], (typeof ALL_PERMISSION)[number]>);

export const BUSINESS_ROLE_PERMISSION = [];

export const SUPER_ADMIN_ROLE_PERMISSION = PERMISSION;

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  BUSINESS: "BUSINESS",
};
