export const tabs = ["Profile", "Security"] as const;

export const accountCopy = {
  title: "Manage account",
  loading: "Loading your account…",
  loadError: "Could not load your account.",
  retry: "Try again",
  tabListLabel: "Account settings",
} as const;

export const genderLabels = { MALE: "Male", FEMALE: "Female", OTHER: "Other" };
export const genders = ["MALE", "FEMALE", "OTHER"] as const;
export const avatarTypes = ["image/jpeg", "image/png", "image/webp"];
export const avatarMaxBytes = 2 * 1024 * 1024;

export const profileCopy = {
  legend: "Profile details",
  invalidPhoto: "Choose a JPEG, PNG, or WebP photo between 1 byte and 2 MB.",
  saved: "Changes saved.",
  saveError: "Could not save your profile.",
  photoTooLarge: "The selected photo exceeds the upload limit.",
  unsupportedPhoto: "Choose a JPEG, PNG, or WebP photo.",
  replacePhoto: "Replace photo",
  choosePhoto: "Choose photo",
  photoHint: "JPEG, PNG, or WebP. Maximum 2 MB.",
  removePhoto: "Remove photo",
  name: "Name",
  nameRequired: "Enter your name.",
  email: "Email",
  dateOfBirth: "Date of birth",
  invalidDate: "Enter a valid date on or before today.",
  gender: "Gender",
  genderPlaceholder: "Select gender",
  genderRequired: "Select a gender.",
  saving: "Saving…",
  save: "Save changes",
  cancel: "Cancel",
  savingStatus: "Saving your profile…",
} as const;

export const passwordFields = [
  { key: "currentPassword", label: "Current password", autoComplete: "current-password" },
  { key: "newPassword", label: "New password", autoComplete: "new-password" },
  { key: "confirmPassword", label: "Confirm password", autoComplete: "new-password" },
] as const;

export const securityCopy = {
  reusedPassword: "Choose a password different from your current password.",
  invalidPassword: "Follow the password requirements below.",
  passwordMismatch: "The passwords must match.",
  changed: "Password changed.",
  changeError: "Could not change your password.",
  change: "Change password",
  changing: "Changing password…",
  changingStatus: "Changing your password…",
  hide: "Hide",
  show: "Show",
  requirements: "Use 6 to 15 characters with at least one uppercase letter, one lowercase letter, one number, and one special character.",
} as const;
