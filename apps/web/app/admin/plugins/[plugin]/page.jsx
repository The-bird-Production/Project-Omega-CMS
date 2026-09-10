"use client"
import dynamic from "next/dynamic";
import Dashboard from "../../../components/admin/Dashboard";
import AdminLayout from "../../../components/layout/AdminLayout";


export default function Page({params}) {

    const plugin = params.plugin; 
     const PluginPage = dynamic(() => import(`../../../components/plugin/${plugin}/dashboard.js`), {
        ssr: false,
    }); 
    

    return (
        <>
            <AdminLayout>
                <Dashboard>
                     <PluginPage></PluginPage> 
                </Dashboard>
            </AdminLayout>
        </>
    );

}