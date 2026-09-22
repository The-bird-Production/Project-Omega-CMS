"use client";
import { use } from "react";
import dynamic from "next/dynamic";

// A plugin's dashboard.js is optional. Without this fallback, a plugin
// with no dashboard.js (or one Next's build didn't know about yet) left
// this page blank instead of telling the admin anything.
function NoSettings({ plugin }) {
    return (
        <div className="p-4">
            <p>Le plugin « {plugin} » ne propose pas de page de paramètres.</p>
        </div>
    );
}

export default function Page(props) {
    const params = use(props.params);

    const plugin = params.plugin;
    const PluginPage = dynamic(
        () => import(`../../../components/plugin/${plugin}/dashboard.js`).catch(() => ({ default: () => <NoSettings plugin={plugin} /> })),
        { ssr: false }
    );

    return <PluginPage />;
}
