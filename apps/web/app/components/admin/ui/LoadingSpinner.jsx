export default function LoadingSpinner({ label = 'Chargement...' }) {
  return (
    <div className="d-flex align-items-center gap-2 text-muted py-3">
      <div className="spinner-border spinner-border-sm" role="status">
        <span className="visually-hidden">{label}</span>
      </div>
      <span>{label}</span>
    </div>
  );
}
