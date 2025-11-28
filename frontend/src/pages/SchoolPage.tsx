import { useState } from "react";
import CreateTeacher from "../components/school/CreateTeacher";
import ViewTeacher from "../components/school/ViewTeacher";
import ManageSubject from "../components/school/ManageSubject";
import SchoolAnalytics from "../components/school/SchoolAnalytics";
import { useNavigate } from "react-router-dom";



import Navbar from "../components/Navbar";

function SchoolPage() {
    const [tab, setTab] = useState("create");
    const navigate = useNavigate();
    
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
            <Navbar />

            <div className="grid grid-cols-4 border-b border-admin-border bg-admin-panel">
                <button className={tabStyle("teacher")} onClick={() => setTab("teacher")}>
                    Create Teacher
                </button>

                <button className={tabStyle("views")} onClick={() => setTab("views")}>
                    View Teachers
                </button>

                <button className={tabStyle("subjects")} onClick={() => setTab("subjects")}>
                    Manage Subjects
                </button>

                <button className={tabStyle("analytics")} onClick={() => setTab("analytics")}>
                    Analytics
                </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-admin-bg">
                { tab === "teacher" && <CreateTeacher/> }
                { tab === "views" && <ViewTeacher/> }
                { tab === "subjects" && <ManageSubject/> }
                { tab === "analytics" && <SchoolAnalytics/> }
            </div>
        </div>
    )
}

export default SchoolPage
