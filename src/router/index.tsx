import { createBrowserRouter } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import HomeRedirect from "@/pages/HomeRedirect";
import RootLayout from "@/layouts/RootLayout";
import Onboarding from "@/features/auth/pages/Onboarding";
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";
import React, { lazy, Suspense } from "react";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import Unauthorized from "@/pages/Unauthorized";
import DoctorsList from "@/features/patient/pages/DoctorsList";
import DoctorDetails from "@/features/patient/pages/DoctorDetails";
import PendingDoctors from "@/features/admin/pages/PendingDoctors";
import AdminDoctorDetails from "@/features/admin/pages/AdminDoctorDetails";
import FindDoctors from "@/features/patient/pages/FindDoctors";
import PatientWallet from "@/features/patient/pages/PatientWallet";
import DoctorAvailability from "@/features/doctor/pages/DoctorAvailability";
import DoctorWallet from "@/features/doctor/pages/DoctorWallet";
import DoctorAppointmentDetails from "@/features/doctor/pages/DoctorAppointmentDetails";
import DoctorProfile from "@/features/doctor/pages/DoctorProfile";

const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'))
const DoctorDashboard = lazy(() => import('@/features/doctor/pages/DoctorDashboard'))
const PatientDashboard = lazy(() => import('@/features/patient/pages/PatientDashboard'))

const PageSkeleton = () => <div> Loading ...</div>

const withSuspense = (element: React.ReactNode) => {
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
        element: <ProtectedRoute onboardingOnly />, 
        children:[                    
          { path: "/onboarding", element: withSuspense(<Onboarding />)  }          
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["ADMIN"]} />, 
        children:[
          { path: "admin", element: withSuspense(<AdminDashboard />) },
          { path: "admin/doctors", element: withSuspense(<PendingDoctors />) },
          { path: "admin/doctors/:doctorId", element: withSuspense(<AdminDoctorDetails />) }                 
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["PATIENT"]} />, 
        children: [
          { path: "patient", element: withSuspense(<PatientDashboard />) },
          // { path: "patient/appointments", element: withSuspense(<PatientAppointments />) },
          { path: "patient/wallet", element: withSuspense(<PatientWallet />) },
          { path: "patient/doctors", element: withSuspense(<FindDoctors />) },
          { path: "patient/doctors/:speciality", element: withSuspense(<DoctorsList />) },
          { path: "patient/doctors/:speciality/:doctorId", element: withSuspense(<DoctorDetails />) },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["DOCTOR"]} />, 
        children:[          
          { path: "/doctor", element: withSuspense(<DoctorDashboard />) },
          { path: "/doctor/availability", element: withSuspense(<DoctorAvailability />) },
          { path: "/doctor/wallet", element: withSuspense(<DoctorWallet />) },
          { path: "/doctor/appointments/:appointmentId", element: withSuspense(<DoctorAppointmentDetails />) },
          { path: "/doctor/profile", element: withSuspense(<DoctorProfile />) }
        ]
      }        
          
    ]  
  }
]);


export default router;