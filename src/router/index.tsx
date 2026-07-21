import { createBrowserRouter } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import Landing from "@/pages/Landing";
import RootLayout from "@/layouts/RootLayout";
import Onboarding from "@/features/auth/pages/Onboarding";
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import Unauthorized from "@/pages/Unauthorized";
import DoctorsList from "@/features/doctor/pages/DoctorsList";
import DoctorDetails from "@/features/doctor/pages/DoctorDetails";

const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'))
const DoctorDashboard = lazy(() => import('@/features/doctor/pages/DoctorDashboard'))
const PatientDashboard = lazy(() => import('@/features/patient/pages/PatientDashboard'))

const PageSkeleton = () => <div> Loading ...</div>

const router = createBrowserRouter([
  { path: "/", 
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Landing /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/unauthorized", element: <Unauthorized /> },
      { 
        element: <ProtectedRoute />, 
        children:[                    
          { path: "/onboarding", element: <Suspense fallback={<PageSkeleton />}><Onboarding /></Suspense> }          
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["ADMIN"]} />, 
        children:[
          { path: "/admin", element: <Suspense fallback={<PageSkeleton />}><AdminDashboard /></Suspense> },          
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["PATIENT", "ADMIN"]} />, 
        children:[          
          { path: "/doctors", element: <Suspense fallback={<PageSkeleton />}><DoctorDashboard /></Suspense> },
          { path: "/doctors/:speciality", element: <Suspense fallback={<PageSkeleton />}><DoctorsList /></Suspense> },
          { path: "/doctors/:speciality/:doctorId", element: <Suspense fallback={<PageSkeleton />}><DoctorDetails /></Suspense> },
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["DOCTOR"]} />, 
        children:[          
          { path: "/patients", element: <Suspense fallback={<PageSkeleton />}><PatientDashboard /></Suspense> }
        ]
      }        
          
    ]  
  }
]);


export default router;