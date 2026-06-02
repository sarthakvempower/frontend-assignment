import React, { useState } from "react";
import { User } from "../types/user.types";

interface Props {
  user: User;
  onSave: (updated: User) => void;
  onCancel: () => void;
}

export function EditRow({ user, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<User>({ ...user });

  function handleChange(field: keyof User, value: string) {
    setDraft({ ...draft, [field]: value });
  }

  return (
    <>
      <td />
      <td>
        <input
          className="edit-input"
          value={draft.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </td>
      <td>
        <input
          className="edit-input"
          value={draft.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </td>
      <td>
        <select
          className="edit-select"
          value={draft.role}
          onChange={(e) => handleChange("role", e.target.value)}
        >
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
      </td>
      <td>
        <button className="btn-save" onClick={() => onSave(draft)}>
          Save
        </button>
        <button className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </td>
    </>
  );
}
