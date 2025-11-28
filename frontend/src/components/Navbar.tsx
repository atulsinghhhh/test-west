import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

function Navbar() {
    const { baseurl, user, setUser, setIsLoggedIn } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
        await axios.post(
            `${baseurl}/auth/logout`,
            {},
            {
            withCredentials: true,
            }
        );

        setIsLoggedIn(false);
        setUser(null);
        navigate("/login");
        } catch (error) {
        console.log("Failed to logout", error);
        }
    };

    return (
        <nav className="w-full bg-gray-900 text-white py-3 shadow-md">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                
                {/* Left - Logo */}
                <h1 className="text-2xl font-bold tracking-wide cursor-pointer">
                    TestWest
                </h1>

                {/* Middle - Username */}
                <p className="text-lg font-semibold">
                {user?.name ? user.name : "User"}
                </p>

                {/* Right - Logout Button */}
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md font-medium transition duration-200"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
