import { RouterProvider } from 'react-router-dom'
import './App.css'
import router from './router'
import { useEffect } from 'react'
import { useAuthStore } from './shared/store/authStore';
import { authApi } from './features/auth/api/auth.api';

const PageSkeleton = () => <div> Loading ...</div>

function App() {
  const { isLoading, setUser, logout, setLoading} = useAuthStore();
  
  useEffect(() => {
    const validateToken = async () => {
      setLoading(true);
      try{
        const token = localStorage.getItem('token');
        if(!token){
          setLoading(false);
          return
        }
        const user = await authApi.getMe();
        setUser(user);        
      }catch(err){
        logout();
      }finally{
        setLoading(false);
      }
    }

    validateToken();
  }, [setUser, logout, setLoading]);
  
  if(isLoading) return <PageSkeleton />
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
