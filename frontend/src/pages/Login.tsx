import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const { baseurl, setUser, setRole, setIsLoggedIn } = useAuth();
    const navigate = useNavigate();

    const [formState, setFormState] = useState({
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const res = await axios.post(
                `${baseurl}/auth/login`,
                {
                    email: formState.email,
                    password: formState.password,
                },
                { withCredentials: true }
            );

            const data = res.data;

            if (data.success) {
                const user = data.user;
                setUser(user);
                setRole(user.role);
                setIsLoggedIn(true);
                localStorage.setItem("user", JSON.stringify(user));

                setMessage("Login successful!");

                if (res.data.user.role === "admin") navigate("/admin/dashboard");
                if (res.data.user.role === "school") navigate("/school");
                if (res.data.user.role === "teacher") navigate("/teacher");
                if (res.data.user.role === "student") navigate("/student/dashboard");
                if(res.data.user.role === "standalone") navigate("/standalone")

            }
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Invalid email or password");
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-admin-bg text-foreground px-4">
            <div className="w-full max-w-sm p-6 bg-admin-panel rounded-xl shadow-xl border border-admin-border">

                <h1 className="text-2xl font-semibold text-center bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                    Login
                </h1>

                {message && <p className="text-primary text-center mt-2">{message}</p>}
                {error && <p className="text-red-400 text-center mt-2">{error}</p>}

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formState.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-admin-bg border border-admin-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formState.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-admin-bg border border-admin-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 rounded-lg bg-primary text-admin-bg font-semibold hover:opacity-90 disabled:opacity-40 transition"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p className="text-center text-muted-foreground text-sm mt-4">
                    Don't have an account?{" "}
                    <span
                        className="text-primary cursor-pointer"
                        onClick={() => navigate("/signup")}
                    >
                        Sign Up
                    </span>
                </p>

            </div>
        </div>
    );
}

export default Login;
