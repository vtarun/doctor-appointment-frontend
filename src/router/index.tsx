import { createBrowserRouter } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import HomeRedirect from "@/pages/HomeRedirect";
import RootLayout from "@/layouts/RootLayout";
import Onboarding from "@/features/auth/pages/Onboarding";
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";
import React, { Children, lazy, Suspense } from "react";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import Unauthorized from "@/pages/Unauthorized";
import DoctorsList from "@/features/doctor/pages/DoctorsList";
import DoctorDetails from "@/features/doctor/pages/DoctorDetails";

const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'))
const DoctorDashboard = lazy(() => import('@/features/doctor/pages/DoctorDashboard'))
const PatientDashboard = lazy(() => import('@/features/patient/pages/PatientDashboard'))

const PageSkeleton = () => <div> Loading ...</div>

const withSuspence = (element: React.ReactNode) => {
  return <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
}

const router = createBrowserRouter([
  { path: "/", 
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/unauthorized", element: <Unauthorized /> },
      { 
        element: <ProtectedRoute />, 
        children:[                    
          { path: "/onboarding", element: withSuspence(<Onboarding />)  }          
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["ADMIN"]} />, 
        // children:[
        //   {
        //     path: "admin",
        //     element: withSuspense(<AdminDashboard />),
        //   },
        //   {
        //     path: "admin/doctors",
        //     element: withSuspense(<PendingDoctors />),
        //   },
        //   {
        //     path: "admin/doctors/:doctorId",
        //     element: withSuspense(<AdminDoctorDetails />),
        //   }                 
        // ]
      },
      {
        element: <ProtectedRoute allowedRoles={["PATIENT"]} />, 
        children:[  
          { path: '/patient', element: withSuspence(<PatientDashboard/>)},        
          { path: "/doctors", element: withSuspence(<DoctorDashboard />) }, //TODO: Why should this route exist?
          { path: "/doctors/:speciality", element: withSuspence(<DoctorsList />) },
          { path: "/doctors/:speciality/:doctorId", element: withSuspence(<DoctorDetails />) },
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["DOCTOR"]} />, 
        children:[          
          { path: "/doctor", element: withSuspence(<DoctorDashboard />) }
        ]
      }        
          
    ]  
  }
]);


export default router;