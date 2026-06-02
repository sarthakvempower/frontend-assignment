/**
 * @file UsersTable.tsx
 * @description Main table component. All state lives here.
 * Handles: search (with typed query state), pagination,
 * row selection, inline editing, single delete, bulk delete.
 *
 * Optional chaining is used throughout when accessing nested values
 * that could theoretically be undefined.
 */

import React, { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { User } from "../types/user.types";
import { UserRow } from "./UserRow";

/** Number of rows shown per page */
const PAGE_SIZE = 10;

/**
 * SVG search icon — inline, no library needed.
 */
function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ color: "#9ca3af" }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/**
 * UsersTable — the main component.
 *
 * State variables:
 *  - query       (string)        what is typed in the search box
 *  - page        (number)        current page number, starts at 1
 *  - editingId   (string|null)   id of the row in edit mode (null = none)
 *  - selectedIds (string[])      ids of checked rows
 */
export function UsersTable() {
  const { users, loading, error, updateUser, deleteUser, deleteMultiple } =
    useUsers();

  /**
   * query: explicitly typed as string (not inferred as never or any).
   * Your lead asked to "add type to setQuery" — this is it.
   * useState<string>('') tells TypeScript the state is always a string.
   */
  const [query, setQuery] = useState<string>("");

  /** Current page number — starts at 1 */
  const [page, setPage] = useState<number>(1);

  /**
   * editingId: which row is in edit mode.
   * string | null — string when a row is being edited, null when none.
   */
  const [editingId, setEditingId] = useState<string | null>(null);

  /**
   * selectedIds: array of user ids that are checked.
   * Uses string[] — simple, easy to explain.
   */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ─── Step 1: Filter ───────────────────────────────────────────────────────

  /**
   * Filter users based on the search query.
   * Optional chaining: u?.name?.toLowerCase() safely handles
   * any user where name might somehow be undefined.
   */
  const filteredUsers = users.filter((u) => {
    const q = query.toLowerCase();
    return (
      (u?.name?.toLowerCase() ?? "").includes(q) ||
      (u?.email?.toLowerCase() ?? "").includes(q) ||
      (u?.role?.toLowerCase() ?? "").includes(q)
    );
  });

  // ─── Step 2: Pagination ────────────────────────────────────────────────────

  /** Total number of pages based on filtered results */
  const totalPages: number = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE),
  );

  /**
   * Clamp currentPage: if search reduces pages below the current page,
   * snap back to page 1 to avoid showing an empty table.
   */
  const currentPage: number = page > totalPages ? 1 : page;

  const start: number = (currentPage - 1) * PAGE_SIZE;
  const pageUsers: User[] = filteredUsers.slice(start, start + PAGE_SIZE);
  const pageIds: string[] = pageUsers.map((u) => u.id);

  // ─── Step 3: Selection ────────────────────────────────────────────────────

  /** True if every row on the current page is checked */
  const allPageSelected: boolean =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  /** True if SOME (not all) rows on this page are checked — for indeterminate state */
  const somePageSelected: boolean =
    pageIds.some((id) => selectedIds.includes(id)) && !allPageSelected;

  /**
   * Toggle one row's checked state.
   * @param id - The user id to toggle
   */
  function toggleRow(id: string): void {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((s) => s !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  /**
   * Select or deselect all rows on the CURRENT PAGE only.
   * Does not affect rows on other pages.
   */
  function togglePageSelection(): void {
    if (allPageSelected) {
      setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
    } else {
      const newIds = pageIds.filter((id) => !selectedIds.includes(id));
      setSelectedIds([...selectedIds, ...newIds]);
    }
  }

  // ─── Step 4: Action handlers ──────────────────────────────────────────────

  /**
   * Handles typing in the search box.
   * Resets to page 1 and clears selection on every search change.
   *
   * @param value - New search text (typed as string explicitly)
   */
  function handleSearch(value: string): void {
    setQuery(value);
    setPage(1);
    setSelectedIds([]);
  }

  /**
   * Called by EditRow when Save is clicked (and validation passed).
   * @param updated - The updated user object
   */
  function handleSave(updated: User): void {
    updateUser(updated);
    setEditingId(null);
  }

  /**
   * Deletes a single user and cleans up selection/editingId.
   * @param id - The user id to delete
   */
  function handleDelete(id: string): void {
    deleteUser(id);
    setSelectedIds(selectedIds.filter((s) => s !== id));
    if (editingId === id) setEditingId(null);
  }

  /** Deletes all currently selected users at once */
  function handleDeleteSelected(): void {
    deleteMultiple(selectedIds);
    setSelectedIds([]);
    setEditingId(null);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) return <div className="loading">Loading users…</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app">
      <div className="card">
        {/* ── Search bar ── */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon-wrap">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by name, email or role"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              aria-label="Search users"
            />
          </div>
        </div>

        {/* ── Table ── */}
        <table>
          <colgroup>
            <col style={{ width: 52 }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "32%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: 120 }} />
          </colgroup>

          <thead>
            <tr>
              <th>
                {/*
                  ref callback: sets indeterminate directly on the DOM element.
                  React has no indeterminate prop, so we must do this imperatively.
                  Optional chaining: el?.indeterminate — el could be null on unmount.
                */}
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = somePageSelected;
                  }}
                  onChange={togglePageSelection}
                  aria-label="Select all on this page"
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageUsers.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty">No users found.</div>
                </td>
              </tr>
            ) : (
              pageUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isSelected={selectedIds.includes(user.id)}
                  isEditing={editingId === user.id}
                  onSelect={() => toggleRow(user.id)}
                  onEdit={() => setEditingId(user.id)}
                  onDelete={() => handleDelete(user.id)}
                  onSave={handleSave}
                  onCancelEdit={() => setEditingId(null)}
                />
              ))
            )}
          </tbody>
        </table>

        {/* ── Footer: Delete Selected + Pagination ── */}
        <div className="footer">
          <button
            className="btn-del-selected"
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
          >
            Delete Selected
          </button>

          {/* Pagination */}
          <div className="pagination">
            {/* First page */}
            <button
              className="pg-btn pg-nav"
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              {/* Double left chevron SVG */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>

            {/* Previous page */}
            <button
              className="pg-btn pg-nav"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pg-btn ${p === currentPage ? "active" : ""}`}
                onClick={() => setPage(p)}
                aria-label={`Page ${p}`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            ))}

            {/* Next page */}
            <button
              className="pg-btn pg-nav"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Last page */}
            <button
              className="pg-btn pg-nav"
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
