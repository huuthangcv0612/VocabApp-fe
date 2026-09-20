import type { AuthUser } from '../types/auth'
import type { UserSubscription } from '../types/gamification'
import type { ClassItem } from '../types/interactiveClass'

export interface InteractivePermissions {
  // General capability to create and manage classes (Custom plan / permissions)
  canManageClasses: boolean
  canCreateClass: boolean
  canCreateLessons: boolean
  canStartLiveSession: boolean

  // Custom plan flag
  isCustomPlan: boolean

  // Learner status
  isStudent: boolean

  // True if user is on Free/Premium and cannot create classes
  needsCustomUpgrade: boolean

  // Backward-compatible alias for class management / teacher control
  isTeacher: boolean
}

export interface ClassOwnershipResult {
  isOwner: boolean
  canManageThisClass: boolean
}

/**
 * Check Interactive Classes permissions based strictly on:
 * 1. user.canManageClasses
 * 2. user.can_create_class
 * 3. user.permissions.includes("class_management")
 * 4. user.plan === "CUSTOM" / hasCustomPlan
 *
 * NOTE: user.role === "teacher" is intentionally NOT used. All registered accounts
 * are standard USERs, and permissions are subscription/permission driven.
 */
export const checkInteractivePermissions = (
  user: AuthUser | null,
  subscription?: UserSubscription | null,
): InteractivePermissions => {
  if (!user) {
    return {
      canManageClasses: false,
      canCreateClass: false,
      canCreateLessons: false,
      canStartLiveSession: false,
      isCustomPlan: false,
      isStudent: true,
      needsCustomUpgrade: false,
      isTeacher: false,
    }
  }

  const role = (user.role || '').toLowerCase()
  const userRecord = user as unknown as Record<string, unknown>
  const subRecord = subscription as unknown as Record<string, unknown> | null
  const isAdmin = role === 'admin' || userRecord?.isAdmin === true

  // 1. Direct Backend Flag: user.canManageClasses
  const hasCanManageClasses =
    typeof user.canManageClasses === 'boolean'
      ? user.canManageClasses
      : (typeof userRecord?.canManageClasses === 'boolean' ? (userRecord.canManageClasses as boolean) : false)

  // 2. Direct Backend Flag: user.can_create_class
  const hasCanCreateClass =
    typeof user.can_create_class === 'boolean'
      ? user.can_create_class
      : (typeof userRecord?.can_create_class === 'boolean' ? (userRecord.can_create_class as boolean) : false)

  // 3. Permissions array: user.permissions.includes("class_management")
  const perms = Array.isArray(user.permissions)
    ? user.permissions
    : Array.isArray(userRecord?.permissions)
    ? (userRecord.permissions as string[])
    : []

  const hasClassPermission =
    perms.includes('class_management') ||
    perms.includes('manage_classes') ||
    perms.includes('create_class')

  // 4. Plan: CUSTOM check
  const planStr = (
    user.plan ||
    user.plan_id ||
    user.subscription?.plan_name ||
    user.subscription?.plan_id ||
    subscription?.plan_name ||
    subscription?.plan_id ||
    ''
  ).toUpperCase()

  const isCustomPlan = Boolean(
    user.hasCustomPlan === true ||
    userRecord?.hasCustomPlan === true ||
    planStr === 'CUSTOM' ||
    planStr.includes('CUSTOM') ||
    subRecord?.isCustom === true ||
    subRecord?.hasCustomPlan === true
  )

  // 5. Backend isTeacher boolean flag (calculated by backend, NOT user.role === 'teacher')
  const hasBackendTeacherFlag =
    user.isTeacher === true ||
    userRecord?.isTeacher === true

  // Priority order:
  // Admin -> canManageClasses -> can_create_class -> permissions -> plan === CUSTOM -> backend isTeacher flag
  let canManage = false
  if (isAdmin) {
    canManage = true
  } else if (hasCanManageClasses) {
    canManage = true
  } else if (hasCanCreateClass) {
    canManage = true
  } else if (hasClassPermission) {
    canManage = true
  } else if (isCustomPlan) {
    canManage = true
  } else if (hasBackendTeacherFlag) {
    canManage = true
  }

  return {
    canManageClasses: canManage,
    canCreateClass: canManage,
    canCreateLessons: canManage,
    canStartLiveSession: canManage,
    isCustomPlan,
    isStudent: !canManage,
    needsCustomUpgrade: !canManage && !isAdmin,
    isTeacher: canManage,
  }
}

/**
 * Determine if a user owns and can manage a specific class instance.
 * Class ownership decides who can edit, delete, add lessons, or launch live sessions.
 */
export const checkClassOwnership = (
  user: AuthUser | null,
  cls: ClassItem | null | undefined,
  permissions?: InteractivePermissions,
): ClassOwnershipResult => {
  if (!user || !cls) {
    return { isOwner: false, canManageThisClass: false }
  }

  const userId = user._id || user.id || ''
  const role = (user.role || '').toLowerCase()
  const userRecord = user as unknown as Record<string, unknown>
  const isAdmin = role === 'admin' || userRecord?.isAdmin === true

  const teacherId =
    typeof cls.teacher_id === 'object' && cls.teacher_id !== null
      ? cls.teacher_id._id || (cls.teacher_id as unknown as { id?: string }).id || ''
      : cls.teacher_id || ''

  const clsRecord = cls as unknown as Record<string, unknown>
  const createdBy = (clsRecord?.created_by as string) || (clsRecord?.user_id as string) || ''

  const isOwner = Boolean(
    isAdmin ||
    (userId && (teacherId === userId || createdBy === userId))
  )

  const canManage = permissions ? permissions.canManageClasses : true
  const canManageThisClass = isOwner && (canManage || isAdmin)

  return { isOwner, canManageThisClass }
}
