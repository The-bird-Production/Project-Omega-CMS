import { Editor } from '@tinymce/tinymce-react';

export default function TinyMCE({ value, onChange }) {
  return (
    <Editor
      apiKey="75lpz4hm0dsvol63mjrqfdqcbrjsey6zewt4wpoi6eoq160r"
      init={{
        plugins:
          'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks',
        toolbar:
          'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
        automatic_uploads: true,
        paste_data_images: true,
        image_list: [`${process.env.NEXT_PUBLIC_BACKEND_URL}/image/*`],
        images_upload_url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/create-article`, // Optionnel, si tu veux indiquer l’URL
        file_picker_types: 'image',
        images_upload_handler: async (blobInfo, progress) => {
          // Construction du FormData
          const formData = new FormData();
          formData.append('image', blobInfo.blob(), blobInfo.filename());

          // Envoi à ton API Next.js
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/image/create-article`,
            {
              method: 'POST',
              body: formData,
              credentials: 'include',
            }
          );

          if (!response.ok) {
            throw new Error("Erreur lors de l'upload de l'image");
          }

          const data = await response.json();

          // TinyMCE s’attend à recevoir une URL d’image en retour
          return data.url; // Exemple : { "url": "https://ton-site.com/uploads/image.jpg" }
        },
        setup: (editor) => {
          // ✅ Ajoute l'attribut crossorigin="anonymous" à chaque image insérée
          editor.on('NodeChange', (e) => {
            e?.element?.querySelectorAll?.('img').forEach((img) => {
              img.setAttribute('crossorigin', 'anonymous');
            });
          });
        },
      }}
      value={value}
      onEditorChange={onChange}
    />
  );
}
