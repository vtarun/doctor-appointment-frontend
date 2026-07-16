import { Link, useNavigate } from "react-router-dom"
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/shared/store/authStore";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import type { LoginFormData } from "@/features/auth/schemas/login.schema";
import { zodResolver } from "@hookform/resolvers/zod";

const Login = () => {
  const { login } = useAuthStore();
  const { register, formState: { errors, isSubmitting, isValid}, handleSubmit, setError } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  const navigate = useNavigate();
  const onSubmit = async (data: LoginFormData) => {
    
    try{      
      const response = await authApi.login(data);
      await login(response.user, response.token);      
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
      console.error("Invalid email or password!");
      setError('root', {message: 'Invalid email or password!'});
    }    
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="user-email">
          <input id="user-email" type="email" {...register('email')} />
        </label>
        {errors.email && <span>{errors.email.message}</span> }
        <label htmlFor="user-password">
          <input id="user-password" type="password" {...register('password')} />
        </label>
        <button type="submit" disabled={isSubmitting || !isValid}>Login</button>
        <p><Link to="/test">forgot password?</Link></p>      
        {errors.root && <span>{errors.root.message}</span> }
      </form>
    </div>
  )
}

export default Login
