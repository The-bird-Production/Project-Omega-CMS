// Next.js will invalidate the cache when a request comes in, at most once every 60 seconds.
import Layout from "../components/layout/MainLayout"

export const revalidate = 60
export const dynamicParams = true // Permet de générer à la volée si la page n’existe pas au build

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

export default async function Page({ params }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/page/get/${params.slug}`)
    if (!res.ok) throw new Error("Page non trouvée")

    const data = await res.json()
    const page = data?.data

    if (!page) {
      return (
        <Layout currentPage="Page introuvable">
          <main>
            <h1>Page introuvable</h1>
            <p>Le contenu demandé n'existe pas.</p>
          </main>
        </Layout>
      )
    }

    const body = { __html: page.body ?? "" }

    return (
      <Layout currentPage={page.title}>
        <title>{page.title}</title>
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
