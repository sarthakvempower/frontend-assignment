/**
 * @file UserRow.tsx
 * @description Renders a single row in the users table.
 *
 * This component has two modes controlled by the `isEditing` prop:
 *   - View mode  → shows the user's data with Edit and Delete buttons
 *   - Edit mode  → renders the EditRow component with inline input fields
 *
 * This component is "presentational" — it never manages any shared state.
 * It only displays what it receives via props and calls the handler
 * functions passed down from UsersTable when the user takes an action.
 */

import React from "react";
import { User, Role } from "../types/user.types";
import { EditRow } from "./EditRow";

/**
 * Props that UsersTable passes down to each UserRow.
 * Every action handler is a function — UserRow calls it, UsersTable handles it.
 */
interface Props {
  /** The user object to display in this row */
  user: User;
  /** Whether the checkbox on this row is currently checked */
  isSelected: boolean;
  /** Whether this row is currently open for editing */
  isEditing: boolean;
  /** Called when the user clicks the row checkbox */
  onSelect: () => void;
  /** Called when the user clicks the Edit (pencil) button */
  onEdit: () => void;
  /** Called when the user clicks the Delete (trash) button */
  onDelete: () => void;
  /** Called by EditRow when the user clicks Save (only fires if validation passes) */
  onSave: (updated: User) => void;
  /** Called by EditRow when the user clicks Cancel */
  onCancelEdit: () => void;
}

/**
 * UserRow — one row of the users table.
 *
 * Optional chaining (user?.name) is used when reading user properties.
 * This means: "read .name, but if user is somehow null/undefined,
 * return undefined instead of throwing a TypeError."
 * TypeScript guarantees user is always a valid User object here,
 * but optional chaining is a defensive habit that prevents runtime crashes.
 *
 * Role enum usage:
 *   user?.role === Role.Admin
 *   instead of: user?.role === 'admin'
 *   Using the enum value means TypeScript will catch any typo at compile time.
 */
export function UserRow({
  user,
  isSelected,
  isEditing,
  onSelect,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
}: Props) {
  /**
   * If isEditing is true, replace the normal cells with EditRow.
   * The parent sets editingId = user.id when Edit is clicked,
   * which makes isEditing true for this row only.
   */
  if (isEditing) {
    return (
      <tr className={isSelected ? "row selected" : "row"}>
        <EditRow user={user} onSave={onSave} onCancel={onCancelEdit} />
      </tr>
    );
  }

  return (
    <tr className={isSelected ? "row selected" : "row"}>
      {/* Checkbox — controlled by the isSelected prop from the parent */}
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          aria-label={`Select ${user?.name ?? "user"}`}
        />
      </td>

      {/* Name — optional chaining safely reads the value */}
      <td>{user?.name}</td>

      {/* Email */}
      <td style={{ color: "#6b7280" }}>{user?.email}</td>

      {/*
        Role — using Role enum to decide the badge CSS class.
        Role.Admin equals the string 'admin', Role.Member equals 'member'.
        The enum just gives us a safe named reference instead of a raw string.
      */}
      <td>
        <span
          className={`badge ${user?.role === Role.Admin ? "badge-admin" : "badge-member"}`}
        >
          {user?.role}
        </span>
      </td>

      {/*
        Action buttons — icons loaded from /public folder.
        <img src="/edit.svg" /> loads public/edit.svg as a static file.
        The CSS classes btn-icon-edit and btn-icon-delete apply
        a CSS filter to tint the SVG grey (edit) and red (delete).
      */}
      <td>
        <button
          className="btn-icon btn-icon-edit"
          onClick={onEdit}
          title="Edit"
          aria-label={`Edit ${user?.name}`}
        >
          <img
            src="/edit.svg"
            width={16}
            height={16}
            alt=""
            aria-hidden="true"
          />
        </button>

        <button
          className="btn-icon btn-icon-delete"
          onClick={onDelete}
          title="Delete"
          aria-label={`Delete ${user?.name}`}
        >
          <img
            src="/delete.svg"
            width={16}
            height={16}
            alt=""
            aria-hidden="true"
          />
        </button>
      </td>
    </tr>
  );
}
