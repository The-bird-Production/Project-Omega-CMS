import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Layout from "./components/layout/MainLayout";
import BlockContent from "./components/BlockContent";

// The home page used to be the one route with no way to edit its content
// at all — a hardcoded placeholder, unrelated to the `page` table every
// other route (see [slug]/page.jsx) reads from. It's now backed by an
// ordinary page row at the well-known slug "home", so it shows up in
// /admin/page like any other page and a theme can seed real content for
// it (content/pages/home.json) the same way it does for every other
// page. No page created yet at that slug (a fresh install, or the
// default theme, which doesn't ship one) falls back to the original
// placeholder rather than a blank or error page.
export const revalidate = 60;

const HOME_SLUG = "home";

async function fetchHomePage() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/page/get/${HOME_SLUG}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data ?? null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const page = await fetchHomePage();

  if (!page) {
    const t = await getTranslations("Home");
    return (
      <Layout pathname="/">
        <center className="m-5 p-5">
          <h1>{t("welcome")}</h1>
          <h2>{t("startEditing")}</h2>
          <Image alt="Logo The bird productiob" src={"/images/logo.png"} width={500} height={500} />
        </center>
      </Layout>
    );
  }

  return (
    <Layout pathname="/">
      <BlockContent as="main" body={page.body} />
    </Layout>
  );
}
