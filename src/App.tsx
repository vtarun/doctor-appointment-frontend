import { useEffect } from 'react'

import './App.css'

import { useAuthStore } from '@/shared/store/authStore';
import { authApi } from '@/features/auth/api/auth.api';

import AppRouter from '@/router';

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
        console.log(err);
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
     <AppRouter />;
      {/* <RouterProvider router={router} /> */}
    </>
  )
}

export default App
