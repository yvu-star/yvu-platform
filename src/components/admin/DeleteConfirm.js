'use client'

import { useState } from 'react'

export default function DeleteConfirm({ itemName, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div className="modal-overlay">
      <div className="confirm-box">
        <div className="confirm-icon">🗑️</div>
        <div className="confirm-title">Delete this item?</div>
        <div className="confirm-message">
          You are about to delete <strong>{itemName}</strong>.<br />
          This action cannot be undone.
        </div>
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}