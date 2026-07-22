import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { registrationSchema, type registrationInput, type registrationOutput } from "../schemas/registration.schema";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const {register, formState: {errors, isSubmitting, isValid}, handleSubmit, setError} = useForm<registrationInput, null, registrationOutput>({
    resolver: zodResolver(registrationSchema)
  });

  const navigate = useNavigate();

  const {mutate, isPending} = useMutation({
    mutationFn: (data: registrationOutput) => authApi.register(data),
    onSuccess:() => {
      navigate('/onboarding');
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
        
        <form onSubmit={handleSubmit(onSubmit)}>
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
              
          <label htmlFor="password">
            <input id="password" type="password" {...register('password')} />
          </label>

          <label htmlFor="confirm-password">
            <input id="confirm-password" type="password" {...register('confirmPassword')} />
          </label>

          <button disabled={isSubmitting || !isValid || isPending}>{isPending ? 'Registering...' : 'Register'}</button>
          {errors.root && <p style={{color: 'red'}}>{errors?.root?.message}</p>}
        </form>
        
    </div>
  )
}

export default Register
