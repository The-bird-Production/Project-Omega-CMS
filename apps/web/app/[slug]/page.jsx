// Next.js will invalidate the cache when a request comes in, at most once every 60 seconds.
import { getTranslations } from "next-intl/server"
import Layout from "../components/layout/MainLayout"
import BlockContent from "../components/BlockContent"
import { blocksToPlainText } from "../../lib/blocks/text"

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
  const t = await getTranslations("Page")
  try {
    const page = await fetchPage(params.slug)
    if (!page) {
      return { title: t("notFound") }
    }

    const text = blocksToPlainText(page.body)
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
  const t = await getTranslations("Page");
  try {
    const page = await fetchPage(params.slug)

    if (!page) {
      return (
        <Layout currentPage={t("notFound")}>
          <main>
            <h1>{t("notFound")}</h1>
            <p>{t("notFoundBody")}</p>
          </main>
        </Layout>
      )
    }

    return (
      <Layout currentPage={page.title}>
        <BlockContent as="main" body={page.body} />
      </Layout>
    )
  } catch (err) {
    console.error("Erreur lors du rendu de la page :", err)
    return (
      <Layout currentPage={t("genericError")}>
        <main>
          <h1>{t("genericError")}</h1>
          <p>{t("loadError")}</p>
        </main>
      </Layout>
    )
  }
}
