import { useState } from 'react'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'

interface Step {
  id: number
  title: string
  description: string
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Personal Information',
    description: 'Your basic details',
  },
  {
    id: 2,
    title: 'Loan Details',
    description: 'What you need',
  },
  {
    id: 3,
    title: 'Financial Information',
    description: 'Your income & expenses',
  },
  {
    id: 4,
    title: 'Collateral',
    description: 'Security details',
  },
  {
    id: 5,
    title: 'Review & Submit',
    description: 'Confirm your application',
  },
]

interface ApplicationWizardProps {
  onComplete: (data: any) => void
  initialData?: any
}

export default function ApplicationWizard({ onComplete, initialData }: ApplicationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(initialData || {})

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(formData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Personal Information
            </h3>
            <Input
              label="First Name"
              value={formData.first_name || ''}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="John"
            />
            <Input
              label="Last Name"
              value={formData.last_name || ''}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              placeholder="Doe"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john@example.com"
            />
            <Input
              label="Phone Number"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+254712345678"
            />
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Loan Details
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loan Type
              </label>
              <select
                value={formData.loan_type || ''}
                onChange={(e) => handleInputChange('loan_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">Select Type</option>
                <option value="PERSONAL">Personal Loan</option>
                <option value="BUSINESS">Business Loan</option>
                <option value="SALARY">Salary Advance</option>
                <option value="EMERGENCY">Emergency Loan</option>
              </select>
            </div>
            <Input
              label="Amount Requested (KES)"
              type="number"
              value={formData.amount_requested || ''}
              onChange={(e) => handleInputChange('amount_requested', e.target.value)}
              placeholder="50000"
            />
            <Input
              label="Loan Term (Months)"
              type="number"
              value={formData.term_months || ''}
              onChange={(e) => handleInputChange('term_months', e.target.value)}
              placeholder="12"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purpose
              </label>
              <textarea
                value={formData.purpose || ''}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Describe the purpose of this loan"
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Financial Information
            </h3>
            <Input
              label="Monthly Income (KES)"
              type="number"
              value={formData.monthly_income || ''}
              onChange={(e) => handleInputChange('monthly_income', e.target.value)}
              placeholder="50000"
            />
            <Input
              label="Other Income (KES)"
              type="number"
              value={formData.other_income || ''}
              onChange={(e) => handleInputChange('other_income', e.target.value)}
              placeholder="0"
            />
            <Input
              label="Monthly Expenses (KES)"
              type="number"
              value={formData.monthly_expenses || ''}
              onChange={(e) => handleInputChange('monthly_expenses', e.target.value)}
              placeholder="20000"
            />
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_existing_loans || false}
                  onChange={(e) => handleInputChange('has_existing_loans', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  I have existing loans
                </span>
              </label>
            </div>
            {formData.has_existing_loans && (
              <Input
                label="Total Existing Loan Amount (KES)"
                type="number"
                value={formData.existing_loan_amount || ''}
                onChange={(e) => handleInputChange('existing_loan_amount', e.target.value)}
                placeholder="0"
              />
            )}
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Collateral Information
            </h3>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_collateral || false}
                  onChange={(e) => handleInputChange('has_collateral', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  I want to provide collateral
                </span>
              </label>
            </div>
            {formData.has_collateral && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Collateral Type
                  </label>
                  <select
                    value={formData.collateral_type || ''}
                    onChange={(e) => handleInputChange('collateral_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="">Select Type</option>
                    <option value="LAND">Land</option>
                    <option value="BUILDING">Building</option>
                    <option value="VEHICLE">Vehicle</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <Input
                  label="Estimated Value (KES)"
                  type="number"
                  value={formData.collateral_value || ''}
                  onChange={(e) => handleInputChange('collateral_value', e.target.value)}
                  placeholder="0"
                />
                <Input
                  label="Description"
                  value={formData.collateral_description || ''}
                  onChange={(e) => handleInputChange('collateral_description', e.target.value)}
                  placeholder="Describe the collateral"
                />
              </>
            )}
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Review Your Application
            </h3>
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Loan Type:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.loan_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount Requested:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    KES {(formData.amount_requested || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Loan Term:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.term_months} months
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monthly Income:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    KES {(formData.monthly_income || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                By submitting this application, you declare that all information provided is accurate
                and complete.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreed_to_terms || false}
                onChange={(e) => handleInputChange('agreed_to_terms', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                I agree to the terms and conditions
              </span>
            </label>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm transition-all ${
                  currentStep >= step.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    currentStep > step.id
                      ? 'bg-primary-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {steps[currentStep - 1].title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="my-6">{renderStepContent()}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handlePrevious}
          variant="secondary"
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Step {currentStep} of {steps.length}
        </div>
        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length && !formData.agreed_to_terms}
        >
          {currentStep === steps.length ? 'Submit' : 'Next'}
          {currentStep < steps.length && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </Card>
  )
}