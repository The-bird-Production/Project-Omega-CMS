import Image from "next/image";
import { useTranslations } from "next-intl";
import Layout from "./components/layout/MainLayout";

export default function Home() {
  const t = useTranslations("Home");

  return (
    <>
      <Layout pathname="/">
        <center className="m-5 p-5">
          <h1>{t("welcome")}</h1>

          <h2>{t("startEditing")}</h2>

          <Image
            alt="Logo The bird productiob"
            src={"/images/logo.png"}
            width={500}
            height={500}
          />
        </center>
      </Layout>
    </>
  );
}
