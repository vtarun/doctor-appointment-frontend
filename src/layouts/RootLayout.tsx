import { useQuery } from "@tanstack/react-query";
import { accountQuery } from "@/features/account/account.api";
import Navbar from "@/shared/components/Navbar";
import { useAuthStore } from "@/shared/store/authStore";
import type { User, UserRoleType } from "@/shared/types";
import { Outlet } from "react-router-dom";

function SignedInNavbar({ user, role }: { user: User; role: UserRoleType }) {
  const { data } = useQuery(accountQuery(user.id));
  return <Navbar role={role} name={data?.name || user.name || "Account"}
    photo={data ? data.avatarUrl : user.avatarUrl} />;
}

const RootLayout = () => {
  const { isAuthenticated, isLoading, user} = useAuthStore();
  const role = !isLoading && isAuthenticated ?  user?.role : null;
  
  return (
    <div>
      {role && user && <SignedInNavbar key={user.id} role={role} user={user} />}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout
