export default function EmptyState({ icon = 'bi-inbox', message }) {
  return (
    <div className="admin-empty-state">
      <i className={`bi ${icon}`} aria-hidden="true" />
      <p className="mb-0">{message}</p>
    </div>
  );
}
