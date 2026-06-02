// Roles a user can have in the system
export enum Role {
  Admin = "admin",
  Member = "member",
}

// Shape of a user object returned from the API
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

// Regex rules for name and email fields
export const VALIDATION = {
  NAME_REGEX: /^[a-zA-Z][a-zA-Z\s'-]{1,49}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Error messages returned per field — absent key means field is valid
export interface ValidationErrors {
  name?: string;
  email?: string;
}

// Validates name and email on the draft before saving.
// Returns an empty object if everything is valid.
export function validateDraft(draft: User): ValidationErrors {
  const errors: ValidationErrors = {};

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
