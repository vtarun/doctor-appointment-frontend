import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";

import { onboardingSchema, type OnboardingFormData, type OnboardingFormInput } from "../schemas/onboarding.schema";

import PersonalInfo from "../components/PersonalInfo";
import PracticeDetails from "../components/PracticeDetails";
import ReviewAndSubmit from "../components/ReviewAndSubmit";
import Credentials from "../components/Credentials";

import { useAuthStore } from "@/shared/store/authStore";
import { axiosInstance } from '@/shared/api/axiosInstance';

type RoleChoice = 'PATIENT' | 'DOCTOR';

const stepFields: Record<number, (keyof OnboardingFormInput)[]> = {
  1: ['fullname', 'dateOfBirth', 'gender'],
  2: ['speciality', 'totalExperience', 'qualification', 'credential'],
  3: ['clinicName', 'city', 'consultationType', 'consultationFee']
}
const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();    
  const [selectedRole, setSelectedRole] = useState<RoleChoice | null>(null);
  const [doctorConfirmed, setDoctorConfirmed] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [roleError, setRoleError] = useState('');

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
      const { data: updatedUser } =
        await axiosInstance.post('/auth/onboard/patient');

      setUser(updatedUser);
      navigate('/patient/doctors', { replace: true });
    } catch {
      setSelectedRole(null);
      setRoleError('Could not save your choice. Please try again.');
    } finally {
      setSavingRole(false);
    }
  };
  const methods = useForm<OnboardingFormInput, unknown, OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
    fullname: user?.name,
    dateOfBirth: user?.dateOfBirth ?? "",
    gender: (user?.gender as OnboardingFormInput['gender']) ?? undefined,
    speciality: '',
    totalExperience: 0,
    qualification: undefined,
    clinicName: '',
    city: '',
    consultationType: undefined,
    consultationFee: 0
    }
  });

  const onSubmit = (data: OnboardingFormData) => {
    console.log(data);
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
    <div>
      {!doctorConfirmed ? (
        <section>
          <h1>How will you use the platform?</h1>

          <label>
            <input
              type="radio"
              name="role"
              checked={selectedRole === 'PATIENT'}
              disabled={savingRole}
              onChange={() => selectRole('PATIENT')}
            />
            Patient
          </label>

          <label>
            <input
              type="radio"
              name="role"
              checked={selectedRole === 'DOCTOR'}
              disabled={savingRole}
              onChange={() => selectRole('DOCTOR')}
            />
            Doctor
          </label>

          {savingRole && <p>Saving your choice...</p>}
          {roleError && <p role="alert">{roleError}</p>}
        </section>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setDoctorConfirmed(false);
              setSelectedRole(null);
            }}
          >
            Back to role selection
          </button>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {currentStep === 1 && <PersonalInfo />}
              {currentStep === 2 && <Credentials />}
              {currentStep === 3 && <PracticeDetails />}

              {currentStep > 1 && (
                <button type="button" onClick={handlePreviousStep}>
                  Back
                </button>
              )}

              {currentStep === 4 && (
                <ReviewAndSubmit onEditSteps={handleGoToStep} />
              )}

              {currentStep < 4 && (
                <button type="button" onClick={handleNextStep}>
                  Next
                </button>
              )}
            </form>
          </FormProvider>
        </>
      )}
    </div>
  )
}

export default Onboarding
