"use client";
import { use } from "react";
import dynamic from "next/dynamic";

export default function Page(props) {
    const params = use(props.params);

    const theme = params.theme;
    const ThemePage = dynamic(() => import(`../../../Themes/${theme}/dashboard.js`), {
       ssr: false,
   });

    return <ThemePage />;
}
