
import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { User } from '../types/user.types';
import { UserRow } from './UserRow';

const PAGE_SIZE = 10;

export function UsersTable() {
  const { users, loading, error, updateUser, deleteUser, deleteMultiple } = useUsers();

  // What the user typed in the search box
  const [query, setQuery] = useState('');

  // Which page we're on (starts at 1)
  const [page, setPage] = useState(1);

  // Which row is being edited right now (null = none)
  const [editingId, setEditingId] = useState<string | null>(null);

  // Which rows are checked (stored as an array of ids)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ─── Step 1: Filter users based on search query ───────────────────────────

  const filteredUsers = users.filter((u) => {
    const q = query.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  // ─── Step 2: Pagination ────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  // If search reduces pages below current page, snap back
  const currentPage = page > totalPages ? 1 : page;

  // Slice the filtered list to get just this page's rows
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageUsers = filteredUsers.slice(start, start + PAGE_SIZE);
  const pageIds = pageUsers.map((u) => u.id);

  // ─── Step 3: Selection helpers ────────────────────────────────────────────

  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const somePageSelected =
    pageIds.some((id) => selectedIds.includes(id)) && !allPageSelected;

  function toggleRow(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((s) => s !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  // Selects or deselects only the rows visible on the current page
  function togglePageSelection() {
    if (allPageSelected) {
      // Deselect all page rows
      setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
    } else {
      // Select all page rows (add ones not already selected)
      const newIds = pageIds.filter((id) => !selectedIds.includes(id));
      setSelectedIds([...selectedIds, ...newIds]);
    }
  }

  // ─── Step 4: Actions ──────────────────────────────────────────────────────

  function handleSearch(value: string) {
    setQuery(value);
    setPage(1); // Go back to page 1 when search changes
    setSelectedIds([]); // Clear selection on search
  }

  function handleSave(updated: User) {
    updateUser(updated);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    deleteUser(id);
    setSelectedIds(selectedIds.filter((s) => s !== id));
    if (editingId === id) setEditingId(null);
  }

  function handleDeleteSelected() {
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

        {/* Search bar */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email or role…"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <span className="count-info">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <table>
          <colgroup>
            <col style={{ width: 44 }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '34%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: 130 }} />
          </colgroup>

          <thead>
            <tr>
              <th>
                {/*
                  Header checkbox — selects/deselects all rows on current page.
                  indeterminate means "some but not all are selected".
                  We pass the ref to set this directly on the DOM element
                  because React doesn't support indeterminate as a prop.
                */}
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = somePageSelected;
                  }}
                  onChange={togglePageSelection}
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

        {/* Footer: delete selected + pagination */}
        <div className="footer">
          <button
            className="btn-del-selected"
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
          >
            Delete Selected {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </button>

          {/* Pagination buttons */}
          <div className="pagination">
            <button
              className="pg-btn"
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button
              className="pg-btn"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pg-btn ${p === currentPage ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              className="pg-btn"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
            <button
              className="pg-btn"
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
