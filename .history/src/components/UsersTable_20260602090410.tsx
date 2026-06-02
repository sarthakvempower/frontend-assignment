import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { User } from '../types/user.types';
import { UserRow } from './UserRow';

const PAGE_SIZE = 10;

export function UsersTable() {

  const { users, loading, error, updateUser, deleteUser, deleteMultiple } = useUsers();

  const [query,       setQuery]       = useState<string>('');
  const [inputValue,  setInputValue]  = useState<string>('');
  const [page,        setPage]        = useState<number>(1);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ─── Filter ───────────────────────────────────────────────────────────────

  // Filters users against the committed query (set on Search button click)
  const filteredUsers = users.filter((user) => {
    const q = query.toLowerCase();
    return (
      (user?.name?.toLowerCase()  ?? '').includes(q) ||
      (user?.email?.toLowerCase() ?? '').includes(q) ||
      (user?.role?.toLowerCase()  ?? '').includes(q)
    );
  });

  // ─── Pagination ───────────────────────────────────────────────────────────

  const totalPages: number  = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  // Clamps page to valid range when search reduces total pages
  const currentPage: number = page > totalPages ? 1 : page;
  const start: number       = (currentPage - 1) * PAGE_SIZE;
  const pageUsers: User[]   = filteredUsers.slice(start, start + PAGE_SIZE);
  const pageIds: string[]   = pageUsers.map((user) => user.id);

  // ─── Selection ────────────────────────────────────────────────────────────

  // True when every visible row on the current page is checked
  const allPageSelected: boolean =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  // True when some (not all) rows on the current page are checked
  const somePageSelected: boolean =
    pageIds.some((id) => selectedIds.includes(id)) && !allPageSelected;

  // Checks or unchecks a single row
  function toggleRow(id: string): void {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  // Checks or unchecks all rows on the current page only
  function togglePageSelection(): void {
    if (allPageSelected) {
      setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
    } else {
      const unselectedIds = pageIds.filter((id) => !selectedIds.includes(id));
      setSelectedIds([...selectedIds, ...unselectedIds]);
    }
  }

  // ─── Search handlers ──────────────────────────────────────────────────────

  // Commits the search — triggers the filter and resets to page 1
  function handleSearch(): void {
    setQuery(inputValue);
    setPage(1);
    setSelectedIds([]);
  }

  // Clears the search input and resets the table to show all users
  function handleClearSearch(): void {
    setInputValue('');
    setQuery('');
    setPage(1);
    setSelectedIds([]);
  }

  // Allows pressing Enter in the search box to trigger search
  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') handleSearch();
  }

  // ─── Action handlers ──────────────────────────────────────────────────────

  // Saves the edited user and closes edit mode
  function handleSave(updated: User): void {
    updateUser(updated);
    setEditingId(null);
  }

  // Deletes one user and cleans up selection and edit state
  function handleDelete(id: string): void {
    deleteUser(id);
    setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    if (editingId === id) setEditingId(null);
  }

  // Deletes all currently selected users at once
  function handleDeleteSelected(): void {
    deleteMultiple(selectedIds);
    setSelectedIds([]);
    setEditingId(null);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) return <div className="loading">Loading users…</div>;
  if (error)   return <div className="error">Error: {error}</div>;

  return (
    <div className="app">
      <div className="card">

        {/* Search bar with Search and Clear buttons */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon-wrap">
              <img src="/search.svg" width={16} height={16} alt="" aria-hidden="true" />
            </span>
            <input
              type="text"
              placeholder="Search by name, email or role"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search users"
            />
          </div>
          <button
            className="btn-search"
            onClick={handleSearch}
            aria-label="Run search"
          >
            Search
          </button>
          {/* Clear button only appears when a search is active */}
          {query && (
            <button
              className="btn-clear-search"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <table>
          {/* Fixed column widths prevent layout shift when edit inputs appear */}
          <colgroup>
            <col style={{ width: 52 }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '32%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: 120 }} />
          </colgroup>

          <thead>
            <tr>
              <th>
                {/*
                  indeterminate cannot be set as a React prop — must be set
                  directly on the DOM element via a ref callback
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

        {/* Footer — Delete Selected on left, pagination centred */}
        <div className="footer">
          <button
            className="btn-del-selected"
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
          >
            Delete Selected
          </button>

          <div className="pagination">

            <button className="pg-btn pg-nav" onClick={() => setPage(1)}
              disabled={currentPage === 1} aria-label="First page">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />
              </svg>
            </button>

            <button className="pg-btn pg-nav" onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1} aria-label="Previous page">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                className={`pg-btn ${pageNumber === currentPage ? 'active' : ''}`}
                onClick={() => setPage(pageNumber)}
                aria-label={`Page ${pageNumber}`}
                aria-current={pageNumber === currentPage ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            ))}

            <button className="pg-btn pg-nav" onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages} aria-label="Next page">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button className="pg-btn pg-nav" onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages} aria-label="Last page">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
              </svg>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
