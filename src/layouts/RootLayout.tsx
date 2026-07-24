import Navbar from "@/shared/components/Nabvar";
import { useAuthStore } from "@/shared/store/authStore";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  const { isAuthenticated, isLoading, user} = useAuthStore();
  const role = !isLoading && isAuthenticated ?  user?.role : null;
  
  return (
    <div>
      {role && <Navbar role={role}/>}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout
