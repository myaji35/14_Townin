export enum UserRole {
  USER = 'user',
  MERCHANT = 'merchant',
  SECURITY_GUARD = 'security_guard',
  MUNICIPALITY = 'municipality',
  SUPER_ADMIN = 'super_admin',
}

export const RoleHierarchy = {
  [UserRole.USER]: 1,
  [UserRole.MERCHANT]: 2,
  [UserRole.SECURITY_GUARD]: 3,
  [UserRole.MUNICIPALITY]: 4,
  [UserRole.SUPER_ADMIN]: 5,
};
