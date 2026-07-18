import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/shared/store/authStore";
import type { UserRoleType } from "../types";

interface ProtectedRouteProps{
  allowedRoles?: UserRoleType[]
}

const ProtectedRoute = ({allowedRoles = []} : ProtectedRouteProps) => {
  const { pathname } = useLocation();
  // const { isAuthenticated, user } = useAuthStore();
  
  // if(!isAuthenticated){
  //  return <Navigate to="/login" replace />;
  // }

  // if(!user?.role){
  //   if(pathname !== '/onboarding'){
  //     return <Navigate to="/onboarding" replace/>;
  //   }
  //   return <Outlet />
  // }

  // if(allowedRoles.length > 0 && !allowedRoles.includes(user.role)){
  //   return <Navigate to="/unauthorized" replace />;
  // }
  
  return <Outlet />
}

export default ProtectedRoute
