import { useAuth } from "../../context/AuthProvider"


function Navbar() {
    const { user } = useAuth();
    console.log("user name",user?.name)
    return (
        <nav>
            {user?.name}
        </nav>
    )
}

export default Navbar
