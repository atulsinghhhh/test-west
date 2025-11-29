import { useAuth } from "../context/AuthProvider";
import { Navigate } from "react-router-dom";

interface Props{
    children: React.ReactElement;
    allowedRoles?: Array<"admin" | "school" | "teacher" | "student" | "standalone">;
}

export const ProtectedRoute = ({children, allowedRoles}: Props) => {
    const { user,loading,isLoggedIn } = useAuth();

    if(loading){
        return <div>Loading...</div>
    }

    if (!isLoggedIn || !user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children
}