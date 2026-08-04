import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/shared/store/authStore";
import type { UserRoleType } from "../types";

interface ProtectedRouteProps{
  allowedRoles?: UserRoleType[],
  onboardingOnly?: Boolean
}

const ProtectedRoute = ({allowedRoles = [], onboardingOnly= false} : ProtectedRouteProps) => {
  const { pathname } = useLocation();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  
  if(isLoading){
    return <p>Loading...</p>
  }

  if(!isAuthenticated){
   return <Navigate to="/login" replace />;
  }

  if(onboardingOnly){
    if(!user?.role){
      return <Outlet />
    }
    return <Navigate to="/" replace/>;
  }
  
  if(!user?.role){
    if(pathname !== '/onboarding'){
      return <Navigate to="/onboarding" replace/>;
    }
    return <Outlet />
  }

  if(allowedRoles.length > 0 && !allowedRoles.includes(user.role)){
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <Outlet />
}

export default ProtectedRoute
