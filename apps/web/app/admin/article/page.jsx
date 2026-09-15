'use client';
import Link from 'next/link';
import Breadcrumb from '../../components/admin/ui/Breadcrumb';
import ArticleList from '../../components/admin/article/articlelist';

export default function Admin() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Articles' }]} />

      <div className="card card-body bg-secondary">
        <ArticleList />
        <div className="mb-3">
          <Link href="/admin/article/new" className="btn btn-primary">
            <i className="bi bi-plus-circle"></i> New
          </Link>
          <Link href="/admin/article/drafts" className="btn btn-primary mx-2">
            <i className="bi bi-journal-text"></i> Drafts
          </Link>
        </div>
      </div>
    </>
  );
}
