// Next.js will invalidate the cache when a
// request comes in, at most once every 60 seconds.


import Layout from "../components/layout/MainLayout"
export const revalidate = 60
 
// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true // or false, to 404 on unknown paths
 
export async function generateStaticParams() {
  const data = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/page/get/all').then((res) =>
    res.json()

  )
  const pages = data.data

  return pages.map((page) => ({
    slug: String(page.slug),
  }))
}
 
export default async function Page({ params }) {
  const data = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL +`/page/get/${params.slug}`).then(
    (res) => res.json()
    
  )
  const page = await data.data
  const body = {__html: `${page.body}`}
  
  
  
  return (
    <Layout currentPage={page.title}>
        <title>{page.title}</title>
        <main dangerouslySetInnerHTML={body}>
            
        </main>
        

    </Layout>
  )
}