import { Navigate, Outlet, useLocation } from "react-router-dom"

interface ProtectedRouteProps{
  allowedRoles?: string[]
}

const ProtectedRoute = ({allowedRoles = []} : ProtectedRouteProps) => {
  const { pathname } = useLocation();
  const token = localStorage.getItem('token');
  let storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  
  if(!token){
   return <Navigate to="/login" replace />;
  }

  if(!user?.role && pathname !== '/onboarding'){
    return <Navigate to="/onboarding" replace/>;
  }

  if(allowedRoles.length > 0 && !allowedRoles.includes(user?.role)){
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <Outlet />
}

export default ProtectedRoute
