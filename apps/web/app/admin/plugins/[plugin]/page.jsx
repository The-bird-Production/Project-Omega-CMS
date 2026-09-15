"use client";
import { use } from "react";
import dynamic from "next/dynamic";

export default function Page(props) {
    const params = use(props.params);

    const plugin = params.plugin;
    const PluginPage = dynamic(() => import(`../../../components/plugin/${plugin}/dashboard.js`), {
       ssr: false,
   });

    return <PluginPage />;
}
