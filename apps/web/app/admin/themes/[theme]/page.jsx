"use client";
import { use } from "react";
import dynamic from "next/dynamic";

// A theme's dashboard.js is optional — many themes have few or no settings
// worth a dedicated page (see docs/plugin-and-theme-development.md). Without
// this fallback, a theme with no dashboard.js (or one Next's build didn't
// know about yet, see the "installer un thème" section of the docs) left
// this page blank instead of telling the admin anything.
function NoSettings({ theme }) {
    return (
        <div className="p-4">
            <p>Le thème « {theme} » ne propose pas de page de paramètres.</p>
        </div>
    );
}

export default function Page(props) {
    const params = use(props.params);

    const theme = params.theme;
    const ThemePage = dynamic(
        () => import(`../../../Themes/${theme}/dashboard.js`).catch(() => ({ default: () => <NoSettings theme={theme} /> })),
        { ssr: false }
    );

    return <ThemePage />;
}
