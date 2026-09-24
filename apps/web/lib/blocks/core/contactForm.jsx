import { createReactBlockSpec } from '@blocknote/react';

// Decorative on purpose, matching the theme-template contact form it
// replaces: submission handling (storage, notifications) is a separate,
// bigger feature, not part of this block. It exists so a contact page
// can be built entirely from blocks (no page-template component needed
// just for this), matching every other page.
const contactFormSpec = createReactBlockSpec(
  { type: 'contactForm', propSchema: {}, content: 'none' },
  {
    render: () => (
      <form className="omega-contact-form" onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="Adresse e-mail" disabled />
        <input type="text" placeholder="Sujet" disabled />
        <input type="tel" placeholder="Téléphone" disabled />
        <textarea placeholder="Message" rows={4} disabled />
        <button type="submit" className="omega-btn omega-btn-primary" disabled>
          Envoyer
        </button>
      </form>
    ),
  }
);

export const contactForm = contactFormSpec();
