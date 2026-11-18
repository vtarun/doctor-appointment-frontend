import { Link, useNavigate } from "react-router-dom"
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/shared/store/authStore";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import type { LoginFormData } from "@/features/auth/schemas/login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { formStyles as ui } from "@/shared/styles/formStyles";

const Login = () => {
  const { login } = useAuthStore();
  const { register, formState: { errors, isSubmitting }, handleSubmit, setError } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  const navigate = useNavigate();
  const onSubmit = async (data: LoginFormData) => {
    
    try{      
      const response = await authApi.login(data);
      login(response.user, response.token);      
      const role = response.user.role;
      if(role === 'PATIENT'){
        navigate('/patient', {replace : true});
      }
      else if(role === 'DOCTOR'){
        navigate('/doctor', {replace : true});
      }
      else if(role === 'ADMIN'){
        navigate('/admin', {replace : true});
      }
      else{
        navigate('/onboarding', {replace : true});
      }
    }catch(err){
      console.error("Invalid email or password!", err);
      setError('root', {message: 'Invalid email or password!'});
    }    
  }

  return (
  <main className={`${ui.page} grid place-items-center`}>
    <section className={`${ui.card} w-full max-w-md`}>
      <div className="mb-8 text-center">
        <p className="mb-3 text-sm font-semibold tracking-widest text-emerald-400">
          DOCTOR APPOINTMENTS
        </p>
        <h1 className={ui.title}>Welcome back</h1>
        <p className={ui.subtitle}>
          Sign in to manage your appointments.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className={ui.label} htmlFor="user-email">
            Email
          </label>
          <input
            id="user-email"
            type="email"
            autoComplete="email"
            className={ui.input}
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className={ui.error} role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className={ui.label} htmlFor="user-password">
            Password
          </label>
          <input
            id="user-password"
            type="password"
            autoComplete="current-password"
            className={ui.input}
            {...register("password")}
          />
          {errors.password && (
            <p className={ui.error} role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {errors.root && (
          <p className={ui.error} role="alert">
            {errors.root.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${ui.primaryButton} w-full`}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-ink">
        New here?{" "}
        <Link to="/register" className="font-medium text-emerald-400 hover:text-emerald-300">
          Create an account
        </Link>
      </p>
    </section>
  </main>
);
}

export default Login
