// Shared by every block that lets an admin upload an image directly
// (cover.jsx, gallery.jsx, BlockEditor.jsx's default image block) — same
// endpoint, same error handling, so this used to be copy-pasted three
// times with no message surfaced on failure beyond a generic one.
//
// A 409 here specifically means the server itself hit a transient race
// (its own temp upload file was gone by the time it went to move it —
// see apps/api/Controllers/Images/CreateImageController.ts) and told the
// client to retry; previously nothing ever did, so the admin just saw a
// hard failure on what the server considered a recoverable hiccup. One
// automatic retry turns that into a no-op in the common case instead of
// forcing a manual re-upload.
export async function uploadImage(file, { retriesLeft = 1 } = {}) {
  const formData = new FormData();
  formData.append('image', file, file.name);

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/image/create-article`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 409 && retriesLeft > 0) {
      return uploadImage(file, { retriesLeft: retriesLeft - 1 });
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Erreur lors de l'upload de l'image");
  }

  const data = await res.json();
  // Prefer building the URL from this app's own configured backend address
  // over the API's `url`: that one depends on the API's BACKEND_URL env var,
  // which some deployments never set (it came back as "undefined/image/..."
  // and the uploaded image never displayed in the editor).
  if (data.file) return `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${data.file}`;
  return data.url;
}
