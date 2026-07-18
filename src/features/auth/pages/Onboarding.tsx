import { FormProvider, useForm } from "react-hook-form";
import { onboardingSchema, type OnboardingFormData, type OnboardingFormInput } from "../schemas/onboarding.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import PersonalInfo from "../components/PersonalInfo";
import PracticeDetails from "../components/PracticeDetails";
import ReviewAndSubmit from "../components/ReviewAndSubmit";
import Credentials from "../components/Credentials";

const stepFields: Record<number, (keyof OnboardingFormInput)[]> = {
  1: ['fullname', 'dateOfBirth', 'gender'],
  2: ['speciality', 'totalExperience', 'qualification', 'credential'],
  3: ['clinicName', 'city', 'consultationType', 'consultationFee']
}
const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const methods = useForm<OnboardingFormInput, unknown, OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
    fullname: '',
    dateOfBirth: undefined,
    gender: undefined,
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
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          {currentStep === 1 && <PersonalInfo />}
          {currentStep === 2 && <Credentials />}
          {currentStep === 3 && <PracticeDetails />}
          {currentStep > 1 &&  <button type="button" onClick={handlePreviousStep}>Back</button> }
          {currentStep === 4 && <ReviewAndSubmit onEditSteps={handleGoToStep}/>}
          {currentStep < 4 &&  <button type="button" onClick={handleNextStep}>Next</button> }
        </form>
      </FormProvider>
    
    </div>
  )
}

export default Onboarding
