"use client"
import dynamic from "next/dynamic";
import Dashboard from "../../../components/admin/Dashboard";
import AdminLayout from "../../../components/layout/AdminLayout";


export default function Page({params}) {

    const theme = params.theme; 
     const ThemePage = dynamic(() => import(`../../../Themes/${theme}/dashboard.js`), {
        ssr: false,
    }); 
    

    return (
        <>
            <AdminLayout>
                <Dashboard>
                     <ThemePage></ThemePage> 
                </Dashboard>
            </AdminLayout>
        </>
    );

}