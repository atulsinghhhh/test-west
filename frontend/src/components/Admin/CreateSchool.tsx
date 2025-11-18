import { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import axios from "axios";

interface ISchool {
    name: string;
    email: string;
    password: string;
    questionAdminLimit: number;
    paperAdminLimit: number;
}

function CreateSchool() {
    const { baseurl } = useAuth();

    const [schoolData, setSchoolData] = useState<ISchool>({
        name: "",
        email: "",
        password: "",
        questionAdminLimit: 0,
        paperAdminLimit: 0,
    });

    const [message, setMessage] = useState<string | null>("");
    const [error, setError] = useState<string | null>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setSchoolData((prev) => ({
        ...prev,
        [name]: name === "questionAdminLimit" || name === "paperAdminLimit"
            ? Number(value)
            : value,
        }));
    };

    const createSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            await axios.post(`${baseurl}/admin/create`, schoolData, { withCredentials: true });

            setMessage("School created successfully!");

            setSchoolData({
                name: "",
                email: "",
                password: "",
                questionAdminLimit: 0,
                paperAdminLimit: 0,
            });
        } catch (error: any) {
            setError(error?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="w-full min-h-full p-8 flex justify-center items-start">
        <div className="w-full max-w-3xl bg-card p-8 rounded-xl border border-admin-border shadow-lg">
            
            <h2 className="text-2xl font-semibold text-foreground mb-6">
                Create New School
            </h2>

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

            <form
                onSubmit={createSchool}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
            {/* School Name */}
            <div className="space-y-2">
                <label htmlFor="name" className="text-foreground font-medium ">
                    School Name
                </label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    value={schoolData.name}
                    onChange={handleChange}
                    placeholder="Enter school name"
                    className="w-full mt-4 bg-input border border-admin-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
                    required
                />
            </div>

            {/* Email */}
            <div className="space-y-2">
                <label htmlFor="email" className="text-foreground font-medium">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={schoolData.email}
                    onChange={handleChange}
                    placeholder="school@example.com"
                    className="w-full bg-input border mt-4 border-admin-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
                    required
                />
            </div>

            {/* Password */}
            <div className="space-y-2">
                <label htmlFor="password" className="text-foreground font-medium">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    value={schoolData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="w-full mt-4 bg-input border border-admin-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
                    required
                />
            </div>

            {/* Question Limit */}
            <div className="space-y-2">
                <label htmlFor="questionAdminLimit" className="text-foreground font-medium">
                Question Limit
                </label>
                <input
                    id="questionAdminLimit"
                    type="number"
                    name="questionAdminLimit"
                    value={schoolData.questionAdminLimit}
                    onChange={handleChange}
                    placeholder="Enter question limit"
                    className="w-full bg-input border mt-4 border-admin-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
                    required
                />
            </div>

            {/* Paper Limit */}
            <div className="space-y-2">
                <label htmlFor="paperAdminLimit" className="text-foreground font-medium">
                Paper Limit
                </label>
                <input
                    id="paperAdminLimit"
                    type="number"
                    name="paperAdminLimit"
                    value={schoolData.paperAdminLimit}
                    onChange={handleChange}
                    placeholder="Enter paper limit"
                    className="w-full bg-input border mt-4 border-admin-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
                    required
                />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 mt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold shadow hover:bg-primary/90 transition disabled:bg-muted"
                >
                    {loading ? "Creating..." : "Create School"}
                </button>
            </div>
            </form>
        </div>
    </div>

);

}

export default CreateSchool;
