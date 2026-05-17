import React from 'react';
import { Loader2, Inbox } from 'lucide-react';

/**
 * Reusable DataTable component
 *
 * Props:
 *  columns      – [{ key, label, width?, align? }]
 *  rows         – array of objects keyed by column.key  (plus optional _key for React key)
 *  loading      – boolean
 *  emptyTitle   – string
 *  emptyMessage – string
 *  minRows      – number of rows visible before scroll (default 5)
 */

// One row height in pixels (padding 14px top+bottom + 1px border ≈ 53px)
const ROW_H = 53;
const THEAD_H = 44;

export default function DataTable({
  columns = [],
  rows = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyMessage = 'Nothing to display yet.',
  minRows = 5,
}) {
  const minBodyH = minRows * ROW_H;
  // Show exactly minRows; scroll starts when content exceeds this
  const maxBodyH = minBodyH;

  return (
    <div
      className="dt-wrapper"
      style={{
        borderRadius: '0.75rem',
        border: '1px solid var(--border)',
        background: 'var(--card)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}
    >
      {/* ── Scrollable container: overflow on the WRAPPER, not tbody ── */}
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'auto',
          minHeight: `${THEAD_H + minBodyH}px`,
          maxHeight: `${THEAD_H + maxBodyH}px`,
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            tableLayout: 'fixed',
          }}
        >
          {/* ── Sticky thead — th sticky within the scroll container ── */}
          <colgroup>
            {columns.map((col) => (
              <col key={col.key} style={{ width: col.width || 'auto' }} />
            ))}
          </colgroup>

          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    padding: '12px 18px',
                    textAlign: col.align || 'left',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase',
                    color: 'var(--muted-foreground)',
                    background: 'var(--sidebar)',
                    borderBottom: '2px solid var(--border)',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <LoadingRow cols={columns.length} minBodyH={minBodyH} />
            ) : rows.length === 0 ? (
              <EmptyRow cols={columns.length} minBodyH={minBodyH} title={emptyTitle} message={emptyMessage} />
            ) : (
              rows.map((row, idx) => (
                <DataRow key={row._key ?? idx} row={row} columns={columns} idx={idx} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Row count footer ── */}
      {!loading && rows.length > 0 && (
        <div
          style={{
            padding: '8px 18px',
            borderTop: '1px solid var(--border)',
            fontSize: '0.72rem',
            color: 'var(--muted-foreground)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          {rows.length} {rows.length === 1 ? 'record' : 'records'}
        </div>
      )}
    </div>
  );
}

/* ─── DataRow ─── */
function DataRow({ row, columns, idx }) {
  const [hovered, setHovered] = React.useState(false);
  const base = idx % 2 === 1 ? 'rgba(255,255,255,0.018)' : 'transparent';

  return (
    <tr
      style={{
        background: hovered ? 'rgba(255,255,255,0.05)' : base,
        transition: 'background 0.12s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {columns.map((col) => (
        <td
          key={col.key}
          style={{
            padding: '13px 18px',
            textAlign: col.align || 'left',
            fontSize: '0.875rem',
            color: 'var(--foreground)',
            borderBottom: '1px solid var(--border)',
            verticalAlign: 'middle',
            overflow: 'hidden',
          }}
        >
          {row[col.key] ?? <span style={{ color: 'var(--muted-foreground)' }}>—</span>}
        </td>
      ))}
    </tr>
  );
}

/* ─── Loading state ─── */
function LoadingRow({ cols, minBodyH }) {
  return (
    <tr>
      <td
        colSpan={cols}
        style={{ height: minBodyH, textAlign: 'center', verticalAlign: 'middle', color: 'var(--muted-foreground)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Loader2 size={26} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
          <span style={{ fontSize: '0.85rem' }}>Loading data…</span>
        </div>
      </td>
    </tr>
  );
}

/* ─── Empty state ─── */
function EmptyRow({ cols, minBodyH, title, message }) {
  return (
    <tr>
      <td
        colSpan={cols}
        style={{ height: minBodyH, textAlign: 'center', verticalAlign: 'middle', color: 'var(--muted-foreground)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Inbox size={34} style={{ opacity: 0.3 }} />
          <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--foreground)' }}>{title}</p>
          <p style={{ margin: 0, fontSize: '0.78rem' }}>{message}</p>
        </div>
      </td>
    </tr>
  );
}
