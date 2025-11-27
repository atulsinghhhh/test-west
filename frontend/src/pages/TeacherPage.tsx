import { useState } from "react"
import Question from "../components/teacher/Question";
import RemainingQuota from "../components/teacher/RemainingQuota";
import PaperGenerator from "../components/teacher/PaperGenerator";
// import TeacherAnalytics from "../components/teacher/TeacherAnalytics";
// import QuestionPublish from "../components/teacher/TeacherAnalytics";


function TeacherPage() {
    const [ tab,setTab ] = useState("questions");

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
            <div className="bg-card border-b border-admin-border px-8 py-4">
                <h1 className="text-2xl font-bold text-foreground">
                    Teacher Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                    Manage Question & paper, show Reamaining Quota
                </p>
                <RemainingQuota/>
            </div>

            <div className="grid grid-cols-3 border-b border-admin-border bg-admin-panel">
                <button className={tabStyle("questions")} onClick={() => setTab("questions")}>
                    Question 
                </button>

                <button className={tabStyle("papers")} onClick={() => setTab("papers")}>
                    Paper 
                </button>

                <button className={tabStyle("publish")} onClick={() => setTab("publish")}>
                    Publish
                </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-admin-bg">
                { tab === "questions" && <Question/>}
                { tab === "papers" && <PaperGenerator/>}
                {/* { tab === "publish" && <QuestionPublish/> } */}

            </div>
        </div>
    )
}

export default TeacherPage
