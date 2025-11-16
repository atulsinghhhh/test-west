import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
    name: string
    email: string
    password: string
    username: string
}

function Signup() {
    const { baseurl } = useAuth(); 
    const navigate = useNavigate();

    const [formState, setFormState] = useState<User>({
        name: "",
        username: "",
        email: "",
        password: "",
    });

    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const res = await axios.post(`${baseurl}/auth/signup`,{
                name: formState.name,email: formState.email,password: formState.password, username:formState.username
            }, { withCredentials: true }); 

            const data = res?.data;
            if (data.success) {
                setMessage("Signup successful! You can login now.");
                setFormState({ name: "", email: "", password: '',username: ''});
            }

            navigate("/login");
        } catch (err) {
            setError("Something went wrong");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white px-4">
            <div className="w-full max-w-sm p-6 bg-[#161b22] rounded-xl shadow-xl border border-[#30363d]">

                <h1 className="text-2xl font-semibold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Create Account
                </h1>

                {message && <p className="text-green-400 text-center mt-2">{message}</p>}
                {error && <p className="text-red-400 text-center mt-2">{error}</p>}

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formState.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-blue-500 outline-none"
                    />
                    <input
                        type="text"
                        name="username"
                        placeholder="username"
                        value={formState.username}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] focus:border-blue-500 outline-none"
                    />

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
                        {loading ? "Creating..." : "Sign Up"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default Signup;
