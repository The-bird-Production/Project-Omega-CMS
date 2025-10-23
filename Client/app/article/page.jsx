import Link from "next/link";
import Layout from "../components/layout/MainLayout";

async function fetchArticles() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/article/get/all`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch articles: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return { error: err };
  }
}

export default async function ArticleListPage() {
  const data = await fetchArticles();

  if (data && data.error) {
    return (
      <Layout currentPage={"ArticleList"}>
        <div className="container mt-4">
          <div className="alert alert-danger">Erreur lors du chargement des articles : {String(data.error.message || data.error)}</div>
        </div>
      </Layout>
    );
  }

  const articles = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <Layout currentPage={"ArticleList"}>
      <div className="container mt-4">
        <h1>Articles</h1>
        {articles.length === 0 ? (
          <p>Aucun article publié pour le moment.</p>
        ) : (
          <div className="list-group">
            {articles.map((a) => (
              <Link href={`/article/${a.slug}`} key={a.id} className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">{a.title}</h5>
                  <small>{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ""}</small>
                </div>
                <p className="mb-1">{(a.body || "").slice(0, 200)}{(a.body || "").length > 200 ? "..." : ""}</p>
                <small>By {a.authorId || 'unknown'}</small>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
