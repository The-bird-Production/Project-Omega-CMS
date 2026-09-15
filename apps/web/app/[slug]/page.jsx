// Next.js will invalidate the cache when a request comes in, at most once every 60 seconds.
import Layout from "../components/layout/MainLayout"

export const revalidate = 60
export const dynamicParams = true // Permet de générer à la volée si la page n’existe pas au build

async function fetchPage(slug) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/page/get/${slug}`)
  if (!res.ok) return null
  const data = await res.json()
  return data?.data ?? null
}

export async function generateMetadata(props) {
  const params = await props.params
  try {
    const page = await fetchPage(params.slug)
    if (!page) {
      return { title: "Page introuvable" }
    }

    const text = (page.body || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
    const description = text.length > 160 ? `${text.slice(0, 157)}...` : text

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
    const pageUrl = siteUrl ? `${siteUrl.replace(/\/$/, "")}/${encodeURIComponent(params.slug)}` : undefined

    return {
      title: page.title,
      description: description || page.title,
      alternates: pageUrl ? { canonical: pageUrl } : undefined,
      openGraph: {
        title: page.title,
        description: description || page.title,
        url: pageUrl,
      },
    }
  } catch {
    return { title: "Page" }
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/page/get/all`)
    if (!res.ok) throw new Error("Erreur lors de la récupération des pages")

    const data = await res.json()
    const pages = data?.data ?? []

    // Si aucune page, on renvoie un tableau vide (Next.js acceptera)
    if (!Array.isArray(pages) || pages.length === 0) {
      console.warn("⚠️ Aucune page trouvée, le build continuera sans pages statiques.")
      return []
    }

    return pages.map((page) => ({
      slug: String(page.slug),
    }))
  } catch (err) {
    console.error("Erreur dans generateStaticParams:", err)
    // On retourne un tableau vide pour ne pas bloquer le build
    return []
  }
}

export default async function Page(props) {
  const params = await props.params;
  try {
    const page = await fetchPage(params.slug)

    if (!page) {
      return (
        <Layout currentPage="Page introuvable">
          <main>
            <h1>Page introuvable</h1>
            <p>Le contenu demandé n&apos;existe pas.</p>
          </main>
        </Layout>
      )
    }

    const body = { __html: page.body ?? "" }

    return (
      <Layout currentPage={page.title}>
        <main dangerouslySetInnerHTML={body} />
      </Layout>
    )
  } catch (err) {
    console.error("Erreur lors du rendu de la page :", err)
    return (
      <Layout currentPage="Erreur">
        <main>
          <h1>Erreur</h1>
          <p>Impossible de charger cette page pour le moment.</p>
        </main>
      </Layout>
    )
  }
}
