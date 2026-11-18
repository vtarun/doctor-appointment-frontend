import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { formStyles as ui } from "@/shared/styles/formStyles";

import { onboardingSchema, type OnboardingFormData, type OnboardingFormInput } from "../schemas/onboarding.schema";

import PersonalInfo from "../components/PersonalInfo";
import PracticeDetails from "../components/PracticeDetails";
import ReviewAndSubmit from "../components/ReviewAndSubmit";
import Credentials from "../components/Credentials";

import { useAuthStore } from "@/shared/store/authStore";
import { authApi } from "../api/auth.api";

type RoleChoice = 'PATIENT' | 'DOCTOR';

const stepFields: Record<number, (keyof OnboardingFormInput)[]> = {
  1: ['fullname', 'dateOfBirth', 'gender'],
  2: ['speciality', 'totalExperience', 'qualification', 'credential'],
  3: ['clinicName', 'city', 'consultationType', 'bio', 'consultationFee']
}
const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitError, setSubmitError] = useState("");      
  const [selectedRole, setSelectedRole] = useState<RoleChoice | null>(null);
  const [doctorConfirmed, setDoctorConfirmed] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [roleError, setRoleError] = useState('');
  
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
 

  
  const methods = useForm<OnboardingFormInput, unknown, OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
    fullname: user?.name,
    dateOfBirth: user?.dateOfBirth ?? "",
    gender: (user?.gender as OnboardingFormInput['gender']) ?? undefined,
    speciality: '',
    totalExperience: 0,
    bio: '',
    qualification: undefined,
    clinicName: '',
    city: '',
    consultationType: undefined,
    consultationFee: 0
    }
  });

  const selectRole = async (role: RoleChoice) => {
    const confirmed = window.confirm(
      role === 'PATIENT'
        ? 'Continue as a patient?'
        : 'Continue as a doctor and complete your profile?'
    );

    if (!confirmed) return;

    setSelectedRole(role);
    setRoleError('');

    if (role === 'DOCTOR') {
      setDoctorConfirmed(true);
      return;
    }

    setSavingRole(true);

    try {
      const { user: updatedUser } = await authApi.onboardPatient();

      setUser(updatedUser);
      navigate('/patient', { replace: true });
    } catch {
      setSelectedRole(null);
      setRoleError('Could not save your choice. Please try again.');
    } finally {
      setSavingRole(false);
    }
  };
  

  const onSubmit = async (data: OnboardingFormData) => {
    setSubmitError("");

  try {
    const { user: updatedUser } = await authApi.onboardDoctor(data);
    setUser(updatedUser);
    navigate("/doctor", { replace: true });
  } catch {
    setSubmitError("Could not submit your doctor profile. Please try again.");
  }
  }

  const handleNextStep = async () => {
    const fields = stepFields[currentStep];

    const isStepValid = await methods.trigger(fields, {shouldFocus: true});

    if(!isStepValid) return;
    
    setCurrentStep(prev => prev + 1);
  }

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }

  const handleGoToStep = (step: number) => {
    setCurrentStep(step);
  }

  return (
    <main className={ui.page}>
      <div className="mx-auto max-w-3xl">
        {!doctorConfirmed ? (
          <>
            <header className="mb-8 text-center">
              <h1 className={ui.title}>How will you use the platform?</h1>
              <p className={ui.subtitle}>
                Choose a role to continue. You will confirm your choice.
              </p>
            </header>

            <div className="grid gap-5 sm:grid-cols-2">
              {(["PATIENT", "DOCTOR"] as const).map((role) => (
                <label
                  key={role}
                  className={`${ui.card} flex cursor-pointer flex-col gap-4 transition hover:border-emerald-500/60 ${
                    selectedRole === role ? "border-emerald-500" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    disabled={savingRole}
                    onChange={() => selectRole(role)}
                    className="h-4 w-4 accent-emerald-500"
                  />

                  <div>
                    <h2 className="text-xl font-semibold text-ink">
                      {role === "PATIENT" ? "Join as a Patient" : "Join as a Doctor"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-ink">
                      {role === "PATIENT"
                        ? "Find specialists and book appointments."
                        : "Create a profile and submit your credentials for review."}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {savingRole && <p className="mt-5 text-center text-muted-ink">Saving...</p>}
            {roleError && <p className={ui.error} role="alert">{roleError}</p>}
          </>
        ) : (
          <section className={`${ui.card} mx-auto max-w-2xl`}>
            <button
              type="button"
              className="mb-6 text-sm text-emerald-400 hover:text-emerald-300"
              onClick={() => {
                setDoctorConfirmed(false);
                setSelectedRole(null);
              }}
            >
              ← Back to role selection
            </button>

            <h1 className={ui.title}>Doctor profile</h1>
            <p className={ui.subtitle}>
              Complete your profile for verification.
            </p>

            <div className="mb-8 mt-6 flex gap-2" aria-label={`Step ${currentStep} of 4`}>
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full ${
                    step <= currentStep ? "bg-emerald-500" : "bg-line"
                  }`}
                />
              ))}
            </div>

            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="space-y-7"
              >
                {currentStep === 1 && <PersonalInfo />}
                {currentStep === 2 && <Credentials />}
                {currentStep === 3 && <PracticeDetails />}
                {currentStep === 4 && (
                  <ReviewAndSubmit onEditSteps={handleGoToStep} />
                )}

                {submitError && (
                  <p className={ui.error} role="alert">{submitError}</p>
                )}

                <div className="flex justify-between gap-3 border-t border-line pt-6">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      className={ui.secondaryButton}
                      onClick={handlePreviousStep}
                    >
                      Back
                    </button>
                  ) : <span />}

                  {currentStep < 4 && (
                    <button
                      type="button"
                      className={ui.primaryButton}
                      onClick={handleNextStep}
                    >
                      Next
                    </button>
                  )}
                </div>
              </form>
            </FormProvider>
          </section>
        )}
      </div>
    </main>
  )
}

export default Onboarding
