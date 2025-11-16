import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthProvider";
import axios from "axios";


interface ISchool {
    _id: string,
    name: string,
    email: string,
    questionAdminLimit: number,
    paperAdminLimit: number
}

function ViewSchool() {
    const { baseurl } = useAuth();
    const [ school,setSchool] = useState<ISchool[]>([]);
    const [ message,setMessage] = useState<String | null>("");
    const [ error,setError ] = useState<String | null>("");

    useEffect(()=>{
        const fetchSchool = async()=>{
            setMessage("");
            setError("");

            try {
                const response = await axios.get(`${baseurl}/admin/`,{withCredentials: true});
                setSchool(response.data.school);
                console.log("school details: ",response.data.school);

            } catch (error) {
                setError("Something went wrong");
            }
        }
        fetchSchool();
    },[])

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-foreground tracking-tight">
                All Schools
            </h1>

            {message && (
                <p className="mb-4 text-sm p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    {message}
                </p>
            )}

            {error && (
                <p className="mb-4 text-sm p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                    {error}
                </p>
            )}

            <div className="rounded-xl border border-admin-border bg-card overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        {/* TABLE HEADER */}
                        <thead className="bg-admin-panel border-b border-admin-border">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-foreground tracking-wide">
                            Name
                            </th>
                            <th className="p-4 text-left text-sm font-semibold text-foreground tracking-wide">
                            Email
                            </th>
                            <th className="p-4 text-left text-sm font-semibold text-foreground tracking-wide">
                            Question Limit
                            </th>
                            <th className="p-4 text-left text-sm font-semibold text-foreground tracking-wide">
                            Paper Limit
                            </th>
                        </tr>
                        </thead>

                        {/* TABLE BODY */}
                        <tbody>
                        {school.length > 0 ? (
                            school.map((school) => (
                            <tr
                                key={school._id}
                                className="border-t border-admin-border hover:bg-admin-hover transition-colors"
                            >
                                <td className="p-4 text-foreground font-medium">{school.name}</td>
                                <td className="p-4 text-muted-foreground">{school.email}</td>
                                <td className="p-4 text-foreground">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                        {school.questionAdminLimit}
                                    </span>
                                </td>
                                <td className="p-4 text-foreground">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                        {school.paperAdminLimit}
                                    </span>
                                </td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                            <td className="p-6 text-center text-muted-foreground" colSpan={4}>
                                No schools found.
                            </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    )
}

export default ViewSchool
