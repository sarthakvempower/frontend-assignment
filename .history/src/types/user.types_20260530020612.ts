/**
 * @file user.types.ts
 * @description All TypeScript types and interfaces for the user domain.
 * Centralised here so every file imports from one place.
 */

/**
 * Enum for user roles.
 *
 * WHY ENUM instead of `type Role = 'admin' | 'member'`?
 *  - An enum gives each value a *name* you can reference in code: Role.Admin
 *  - If you later rename 'admin' to 'administrator' you change it in ONE place
 *  - TypeScript catches it everywhere else automatically
 *  - A plain string union like `'admin' | 'member'` works too, but an enum
 *    makes the intent clearer and is easier to loop over (Object.values(Role))
 *
 * const enum means the values are inlined at compile time (no runtime object).
 */
export enum Role {
  Admin = "admin",
  Member = "member",
}

/**
 * Represents a single user returned from the API.
 *
 * Optional chaining note:
 *  When you access a property on a value that might be undefined, use ?.
 *  Example:  user?.name   → returns undefined instead of throwing an error
 *  We don't need it on the interface itself, but you'll see it used in
 *  components where a user prop *could* be undefined before data loads.
 */
export interface User {
  /** Unique identifier — comes from the API, treated as read-only */
  id: string;
  /** Full display name of the user */
  name: string;
  /** Email address — validated with regex before saving */
  email: string;
  /** Role of the user in the system */
  role: Role;
}

/**
 * Validation regex patterns — defined once, imported anywhere needed.
 *
 * NAME_REGEX:
 *   ^        → start of string
 *   [a-zA-Z] → must start with a letter
 *   [a-zA-Z\s'-]* → then any letters, spaces, hyphens, apostrophes
 *   {1,49}   → total length 2–50 characters
 *   $        → end of string
 *
 * EMAIL_REGEX:
 *   Standard email pattern — one or more chars, @, domain, dot, extension
 */
export const VALIDATION = {
  NAME_REGEX: /^[a-zA-Z][a-zA-Z\s'-]{1,49}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

/**
 * Validation error shape — returned by validateDraft().
 * Each key maps to an error message string, or undefined if valid.
 */
export interface ValidationErrors {
  name?: string;
  email?: string;
}

/**
 * Validates a user draft before saving.
 * Returns an object with error messages for any invalid fields.
 * Empty object {} means everything is valid.
 *
 * @param draft - The user object being edited
 * @returns ValidationErrors object (empty = no errors)
 */
export function validateDraft(draft: User): ValidationErrors {
  const errors: ValidationErrors = {};

  // Optional chaining: draft?.name trims safely even if name is somehow undefined
  const name = draft?.name?.trim() ?? "";
  const email = draft?.email?.trim() ?? "";

  if (!name) {
    errors.name = "Name cannot be blank";
  } else if (!VALIDATION.NAME_REGEX.test(name)) {
    errors.name =
      "Name must be 2–50 letters (spaces, hyphens, apostrophes allowed)";
  }

  if (!email) {
    errors.email = "Email cannot be blank";
  } else if (!VALIDATION.EMAIL_REGEX.test(email)) {
    errors.email = "Enter a valid email address";
  }

  return errors;
}
