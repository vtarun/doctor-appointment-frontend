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
        element: <ProtectedRoute allowedRoles={["admin"]} />, 
        children:[
          { path: "/admin", element: <Suspense fallback={<PageSkeleton />}><AdminDashboard /></Suspense> },          
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["doctors"]} />, 
        children:[          
          { path: "/doctors", element: <Suspense fallback={<PageSkeleton />}><DoctorDashboard /></Suspense> }
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["patients"]} />, 
        children:[          
          { path: "/patients", element: <Suspense fallback={<PageSkeleton />}><PatientDashboard /></Suspense> }
        ]
      }        
          
    ]  
  }
]);


export default router;