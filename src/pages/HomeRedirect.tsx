import { useAuthStore } from "@/shared/store/authStore"
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";

const HomeRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!user?.role) {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

  switch (user.role) {
    case "PATIENT":
      return <Navigate to={ROUTES.patient.root} replace />;
    case "DOCTOR":
      return <Navigate to={ROUTES.doctor.root} replace />;
    case "ADMIN":
      return <Navigate to={ROUTES.admin.root} replace />;
    default:
      return <Navigate to={ROUTES.unauthorized} replace />;
  }
};

export default HomeRedirect
