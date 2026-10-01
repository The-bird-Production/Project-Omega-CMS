import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware wrappers around next/link and next/navigation — these
// automatically add/strip the locale prefix so the rest of the app can
// link to "/contact" without caring whether the current locale is the
// unprefixed default or not.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
