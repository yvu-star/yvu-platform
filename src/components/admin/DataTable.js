'use client'

import { memo, useMemo } from 'react'

// Memoized individual row — only re-renders when its own row data changes.
// This means typing in a form or opening a modal above doesn't touch the rows.
const TableRow = memo(function TableRow({ row, columns, onEdit, onDelete, editLabel }) {
  return (
    <tr>
      {columns.map(col => (
        <td key={col.key}>
          {col.render ? col.render(row) : row[col.key] ?? '—'}
        </td>
      ))}
      <td>
        <div className="data-table-actions">
          {onEdit && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onEdit(row)}
            >
              {editLabel || 'Edit'}
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(row)}
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  )
})

// Memoized thead — columns never change at runtime so this never re-renders
const TableHead = memo(function TableHead({ columns }) {
  return (
    <thead>
      <tr>
        {columns.map(col => (
          <th key={col.key}>{col.label}</th>
        ))}
        <th>Actions</th>
      </tr>
    </thead>
  )
})

function DataTable({ columns, data, loading, onEdit, onDelete, emptyMessage, editLabel }) {
  // Memoize the full row list so parent re-renders (modal open/close,
  // form field changes) don't rebuild the tbody unless data actually changes.
  const rows = useMemo(() => {
    if (!data || data.length === 0) return []
    return data.map(row => (
      <TableRow
        key={row.id}
        row={row}
        columns={columns}
        onEdit={onEdit}
        onDelete={onDelete}
        editLabel={editLabel}
      />
    ))
  }, [data, columns, onEdit, onDelete, editLabel])

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        Loading...
      </div>
    )
  }

  return (
    <div className="data-table-wrapper">
      <div className="data-table-toolbar">
        <span className="data-table-count">
          {data.length} {data.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      <table className="data-table">
        <TableHead columns={columns} />
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1}>
                <div className="data-table-empty">
                  {emptyMessage || 'No records found.'}
                </div>
              </td>
            </tr>
          ) : (
            rows
          )}
        </tbody>
      </table>
    </div>
  )
}

// Wrap the whole component so parent re-renders skip it entirely
// when data, columns, and callbacks haven't changed.
export default memo(DataTable)