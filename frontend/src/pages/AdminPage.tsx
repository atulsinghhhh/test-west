import { useState } from "react";
import CreateSchool from "../components/Admin/CreateSchool";
import ViewSchool from "../components/Admin/ViewSchool";

function AdminPage() {
    const [tab, setTab] = useState("create");

    const tabStyle = (name: any) =>
        `w-full text-center py-4 px-6 font-medium transition-all duration-200
        border-r border-admin-border last:border-r-0
        ${
            tab === name
            ? "bg-admin-panel text-primary border-b-2 border-primary shadow-[inset_0_-2px_6px_rgba(45,211,111,0.3)]"
            : "bg-admin-panel text-muted-foreground hover:bg-admin-hover hover:text-foreground"
        }`;

    return (
        <div className="h-screen w-screen bg-admin-bg flex flex-col">
        
        {/* Header */}
        <div className="bg-card border-b border-admin-border px-8 py-4">
            <h1 className="text-2xl font-bold text-foreground">
                Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
                Manage schools and view analytics
            </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 border-b border-admin-border bg-admin-panel">
            <button className={tabStyle("create")} onClick={() => setTab("create")}>Create School</button>
            <button className={tabStyle("view")} onClick={() => setTab("view")}>View Schools</button>
            <button className={tabStyle("analytics")} onClick={() => setTab("analytics")}>Analytics</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-admin-bg">
            {tab === "create" && <CreateSchool />}
            {tab === "view" && <ViewSchool />}
        </div>
        </div>
    );
}

export default AdminPage;
