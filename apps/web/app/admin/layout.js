import AdminShell from '../components/admin/AdminShell';
import { getSiteName } from '../../lib/siteName';

// Admin tab titles: "<section> · Administration · <site name>" (each
// section sets its own, see lib/adminMetadata.js), so admin tabs can be
// told apart from each other and from the public site's.
export async function generateMetadata() {
  return {
    title: { absolute: `Administration · ${await getSiteName()}` },
    robots: { index: false, follow: false },
  };
}

export default function AdminRouteLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
