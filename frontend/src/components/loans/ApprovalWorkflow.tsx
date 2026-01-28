import { useState } from 'react'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck,
  DollarSign,
  Send,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface WorkflowStep {
  id: string
  name: string
  status: 'PENDING' | 'COMPLETED' | 'REJECTED'
  icon: React.ReactNode
  assignee?: string
  dueDate?: string
  notes?: string
}

interface ApprovalWorkflowProps {
  loanId: number
  currentStep: string
  onStepComplete?: (stepId: string, data: any) => void
}

export default function ApprovalWorkflow({
  loanId,
  currentStep,
  onStepComplete,
}: ApprovalWorkflowProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'application',
      name: 'Application Submitted',
      status: 'COMPLETED',
      icon: <FileCheck className="h-5 w-5" />,
    },
    {
      id: 'document_verification',
      name: 'Document Verification',
      status: currentStep === 'document_verification' ? 'PENDING' : 'COMPLETED',
      icon: <FileCheck className="h-5 w-5" />,
      assignee: 'John Mwangi',
      dueDate: '2024-12-20',
    },
    {
      id: 'credit_check',
      name: 'Credit Check',
      status:
        currentStep === 'credit_check' || currentStep === 'document_verification'
          ? 'PENDING'
          : 'COMPLETED',
      icon: <AlertCircle className="h-5 w-5" />,
      assignee: 'Credit Team',
    },
    {
      id: 'risk_assessment',
      name: 'Risk Assessment',
      status:
        currentStep === 'risk_assessment' ||
        currentStep === 'document_verification' ||
        currentStep === 'credit_check'
          ? 'PENDING'
          : 'COMPLETED',
      icon: <AlertCircle className="h-5 w-5" />,
    },
    {
      id: 'approval',
      name: 'Approval Decision',
      status:
        currentStep === 'approval' ||
        currentStep === 'document_verification' ||
        currentStep === 'credit_check' ||
        currentStep === 'risk_assessment'
          ? 'PENDING'
          : 'COMPLETED',
      icon: <CheckCircle2 className="h-5 w-5" />,
      assignee: 'Manager',
    },
    {
      id: 'disbursement',
      name: 'Disbursement',
      status: 'PENDING',
      icon: <DollarSign className="h-5 w-5" />,
    },
  ])

  const [actionData, setActionData] = useState({
    approval: {
      approved: false,
      amount: 100000,
      notes: '',
    },
  })

  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300'
      case 'REJECTED':
        return 'bg-danger-100 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300'
      case 'PENDING':
        return 'bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300'
    }
  }

  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-6 w-6 text-success-600" />
      case 'REJECTED':
        return <XCircle className="h-6 w-6 text-danger-600" />
      case 'PENDING':
        return <Clock className="h-6 w-6 text-warning-600" />
    }
  }

  const handleApprove = (stepId: string) => {
    onStepComplete?.(stepId, actionData[stepId as keyof typeof actionData])
    const updatedSteps = steps.map((s) =>
      s.id === stepId ? { ...s, status: 'COMPLETED' as const } : s
    )
    setSteps(updatedSteps)
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Approval Workflow
      </h3>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={step.id}>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}
                >
                  {step.status === 'PENDING' ? (
                    <Clock className="h-6 w-6 text-warning-600" />
                  ) : step.status === 'REJECTED' ? (
                    <XCircle className="h-6 w-6 text-danger-600" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-success-600" />
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-1 h-12 mt-2 ${
                      steps[idx + 1].status === 'COMPLETED'
                        ? 'bg-success-300'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>

              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{step.name}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(step.status)}`}
                  >
                    {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                  </span>
                </div>

                {step.assignee && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Assigned to: {step.assignee}
                  </p>
                )}

                {step.dueDate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Due: {new Date(step.dueDate).toLocaleDateString()}
                  </p>
                )}

                {step.status === 'PENDING' && step.id === currentStep && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {step.id === 'approval' && (
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={actionData.approval.approved}
                            onChange={(e) =>
                              setActionData({
                                ...actionData,
                                approval: { ...actionData.approval, approved: e.target.checked },
                              })
                            }
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Approve this loan
                          </span>
                        </label>

                        {actionData.approval.approved && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Approved Amount (KES)
                            </label>
                            <input
                              type="number"
                              value={actionData.approval.amount}
                              onChange={(e) =>
                                setActionData({
                                  ...actionData,
                                  approval: { ...actionData.approval, amount: Number(e.target.value) },
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes
                          </label>
                          <textarea
                            value={actionData.approval.notes}
                            onChange={(e) =>
                              setActionData({
                                ...actionData,
                                approval: { ...actionData.approval, notes: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            rows={2}
                            placeholder="Add approval notes"
                          />
                        </div>

                        <Button
                          onClick={() => handleApprove(step.id)}
                          className="w-full"
                          size="sm"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit Approval
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}