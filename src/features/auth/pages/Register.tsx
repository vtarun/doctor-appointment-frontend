import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { registrationSchema, type registrationInput, type registrationOutput } from "../schemas/registration.schema";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/store/authStore";

const Register = () => {
  const {register, formState: {errors, isSubmitting }, handleSubmit, setError} = useForm<registrationInput, null, registrationOutput>({
    resolver: zodResolver(registrationSchema)
  });

  const { login } = useAuthStore();

  const navigate = useNavigate();

  const {mutate, isPending} = useMutation({
    mutationFn: (data: registrationOutput) => authApi.register(data),
    onSuccess:({user, token}) => {
      login(user, token); 
      navigate('/onboarding', {replace: true});
    },
    onError: (error) => {
      setError('root', {message: error.message})
    }
  });

  const onSubmit = (data: registrationOutput) => {
    mutate(data);
  }

  return (
    <div>
        
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flexDirection: 'column'}}>
          <label htmlFor="user-name">Name: 
            <input id="user-name" type="text" {...register('name')} />
          </label>
          {errors.name && <span>{errors.name.message}</span> }

          <label htmlFor="user-email">Email: 
            <input id="user-email" type="email" {...register('email')} />
          </label>
          {errors.email && <span>{errors.email.message}</span> }
          
          <label htmlFor="gender">Gender: 
            <select id="gender" {...register("gender") }>
              <option value="">Select...</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          {errors.gender && <p>{errors.gender.message}</p>}
            
          <label htmlFor="dob">Date of Birth: 
            <input id="dob" type="date" {...register("dateOfBirth")} />              
          </label>            
          {errors.dateOfBirth && <p>{errors.dateOfBirth.message}</p>}
              
          <label htmlFor="password">Password
            <input id="password" type="password" {...register('password')} />
          </label>
          {errors.password && <p role="alert">{errors.password.message}</p> }

          <label htmlFor="confirm-password"> Confirm password
            <input id="confirm-password" type="password" {...register('confirmPassword')} />
          </label>
          
          {errors.confirmPassword && <p role="alert">{errors.confirmPassword.message}</p> }

          <button disabled={isSubmitting || isPending}>{isPending ? 'Registering...' : 'Register'}</button>          
          {errors.root && <p style={{color: 'red'}}>{errors?.root?.message}</p>}
        </form>
        
    </div>
  )
}

export default Register
