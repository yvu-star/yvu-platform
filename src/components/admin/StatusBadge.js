export default function StatusBadge({ status }) {
  const map = {
    published: { label: 'Published', className: 'badge badge-published' },
    draft:     { label: 'Draft',     className: 'badge badge-draft'     },
    new:       { label: 'New',       className: 'badge badge-new'       },
    read:      { label: 'Read',      className: 'badge badge-read'      },
  }

  const config = map[status] || { label: status, className: 'badge badge-draft' }

  return <span className={config.className}>{config.label}</span>
}