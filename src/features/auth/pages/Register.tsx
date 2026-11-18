import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { registrationSchema, type registrationInput, type registrationOutput } from "../schemas/registration.schema";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/shared/store/authStore";

import { formStyles as ui } from "@/shared/styles/formStyles";

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
  <main className={`${ui.page} grid place-items-center`}>
    <section className={`${ui.card} w-full max-w-xl`}>
      <div className="mb-8 text-center">
        <p className="mb-3 text-sm font-semibold tracking-widest text-emerald-400">
          DOCTOR APPOINTMENTS
        </p>
        <h1 className={ui.title}>Create your account</h1>
        <p className={ui.subtitle}>
          You can choose Patient or Doctor after registration.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className={ui.label} htmlFor="user-name">Full name</label>
          <input
            id="user-name"
            className={ui.input}
            autoComplete="name"
            {...register("name")}
          />
          {errors.name && <p className={ui.error} role="alert">{errors.name.message}</p>}
        </div>

        <div>
          <label className={ui.label} htmlFor="user-email">Email</label>
          <input
            id="user-email"
            type="email"
            className={ui.input}
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && <p className={ui.error} role="alert">{errors.email.message}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={ui.label} htmlFor="gender">Gender</label>
            <select id="gender" className={ui.select} {...register("gender")}>
              <option value="">Select...</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.gender && <p className={ui.error} role="alert">{errors.gender.message}</p>}
          </div>

          <div>
            <label className={ui.label} htmlFor="dob">Date of birth</label>
            <input
              id="dob"
              type="date"
              className={ui.input}
              {...register("dateOfBirth")}
            />
            {errors.dateOfBirth && (
              <p className={ui.error} role="alert">{errors.dateOfBirth.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className={ui.label} htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className={ui.input}
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && <p className={ui.error} role="alert">{errors.password.message}</p>}
        </div>

        <div>
          <label className={ui.label} htmlFor="confirm-password">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            className={ui.input}
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className={ui.error} role="alert">{errors.confirmPassword.message}</p>
          )}
        </div>

        {errors.root && <p className={ui.error} role="alert">{errors.root.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className={`${ui.primaryButton} w-full`}
        >
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-ink">
        Already registered?{" "}
        <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
          Sign in
        </Link>
      </p>
    </section>
  </main>
);
}

export default Register
