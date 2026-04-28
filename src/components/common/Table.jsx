import "./Table.css";

export default function Table({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found.",
}) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="table-th">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="table-status-cell">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-status-cell">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id ?? rowIndex} className="table-row">
                {columns.map((col) => (
                  <td key={col.key} className="table-td">
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
