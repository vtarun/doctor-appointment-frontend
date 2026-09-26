import Navbar from "@/shared/components/Navbar";
import { useAuthStore } from "@/shared/store/authStore";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  const { isAuthenticated, isLoading, user} = useAuthStore();
  // const role = !isLoading && isAuthenticated ?  user?.role : null;
  const role = 'DOCTOR'; // TODO: remove after local test
  
  return (
    <div>
      {role && <Navbar role={role} name={user?.name || 'Dr Vivek'}/>}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout
