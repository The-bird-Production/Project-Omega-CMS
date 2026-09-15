// Thin wrapper so every destructive admin action confirms the same way, and
// so the confirmation strategy (native confirm() today) can change in one
// place later without touching every call site.
export function confirmAction(message) {
  return window.confirm(message);
}
