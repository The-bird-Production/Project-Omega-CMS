import Image from "next/image";
import Layout from "./components/layout/MainLayout";

export default function Home() {
  return (
    <>
      <Layout currentPage={"Default"}>
        <center className="m-5 p-5">
          <h1>Welcome to Omega</h1>

          <h2>Start Editing to see your changes.</h2>

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
