import { adminMetadata } from '../../../lib/adminMetadata';

// Tab title for this admin section (see lib/adminMetadata.js).
export const generateMetadata = adminMetadata('Plugins');

export default function Layout({ children }) {
  return children;
}
