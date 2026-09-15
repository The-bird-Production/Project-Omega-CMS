import Link from 'next/link';

// items: [{ label, href? }] — the last item (no href, or the last one regardless) renders as the active crumb.
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="breadcrumb" className="admin-breadcrumb">
      <ol className="breadcrumb mb-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className={`breadcrumb-item${isLast ? ' active' : ''}`}
              aria-current={isLast ? 'page' : undefined}
            >
              {!isLast && item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
