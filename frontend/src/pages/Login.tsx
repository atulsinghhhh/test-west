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

                const destination =
                    user.role === "teacher"
                        ? "/teacher"
                        : user.role === "school"
                            ? "/school"
                            : "/dashboard";

                setTimeout(() => navigate(destination), 600);
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
        <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white px-4">
            <div className="w-full max-w-sm p-6 bg-[#161b22] rounded-xl shadow-xl border border-[#30363d]">

                <h1 className="text-2xl font-semibold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Login
                </h1>

                {message && <p className="text-green-400 text-center mt-2">{message}</p>}
                {error && <p className="text-red-400 text-center mt-2">{error}</p>}

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formState.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-blue-500 outline-none"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formState.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-purple-500 outline-none"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-semibold disabled:opacity-40"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p className="text-center text-gray-400 text-sm mt-4">
                    Don't have an account?{" "}
                    <span
                        className="text-blue-400 cursor-pointer"
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
