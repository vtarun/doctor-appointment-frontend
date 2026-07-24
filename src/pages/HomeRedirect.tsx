import { useAuthStore } from "@/shared/store/authStore"
import { Navigate } from "react-router-dom";

const HomeRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if(isLoading){
    return <p>Loading...</p>
  }

  if(!isAuthenticated){
    return <Navigate to='/login' replace />
  }

  
  if(!user?.role){
    return <Navigate to='/onboarding' replace/>
  }

  switch(user.role){
    case 'PATIENT':
      return <Navigate to='/patient' replace/>;
    case 'DOCTOR':
      return <Navigate to='/doctor' replace/>;
    case 'ADMIN':
      return <Navigate to='/admin' replace/>;
    default:
      return <Navigate to='/unauthorized' replace/>;
  }  
};

export default HomeRedirect
