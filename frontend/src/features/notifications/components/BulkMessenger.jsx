import React, { useMemo, useState } from 'react'
import { AlertCircle, CheckCircle, Send, Users } from 'lucide-react'
import { cn } from '@utils/cn'

const parseRecipients = (rawText, templateType) => {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return lines
    .map((line) => {
      const parts = line.split(',').map((part) => part.trim()).filter(Boolean)

      if (templateType === 'SMS' || templateType === 'WHATSAPP') {
        const [nameOrPhone, phoneMaybe] = parts
        const phone = phoneMaybe || nameOrPhone
        const name = phoneMaybe ? nameOrPhone : phone
        if (!phone) return null
        return { name, phone }
      }

      const [nameOrEmail, emailMaybe] = parts
      const email = emailMaybe || nameOrEmail
      const name = emailMaybe ? nameOrEmail : email.split('@')[0]
      if (!email || !/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(email)) return null
      return { name, email }
    })
    .filter(Boolean)
}

const BulkMessenger = ({
  templates = [],
  onSend,
  isSending = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    template_id: '',
    recipients: '',
    contextText: '{}',
  })
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [localError, setLocalError] = useState('')

  const selectedTemplate = useMemo(
    () => templates.find((template) => String(template.id) === String(formData.template_id)) || null,
    [formData.template_id, templates]
  )

  const templateType = selectedTemplate?.template_type || 'EMAIL'
  const recipientHint = templateType === 'SMS' || templateType === 'WHATSAPP'
    ? 'Format each line as Name,+2547XXXXXXXX or just +2547XXXXXXXX'
    : 'Format each line as Name,email@example.com or just email@example.com'

  const recipientList = useMemo(
    () => parseRecipients(formData.recipients, templateType),
    [formData.recipients, templateType]
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setLocalError('')
  }

  const handleSend = async () => {
    if (!formData.template_id || recipientList.length === 0) {
      setLocalError('Select a template and provide at least one valid recipient.')
      return
    }

    let parsedContext = {}
    try {
      parsedContext = formData.contextText ? JSON.parse(formData.contextText) : {}
    } catch {
      setLocalError('Additional context must be valid JSON.')
      return
    }

    try {
      await onSend({
        template_id: formData.template_id,
        recipients: recipientList,
        context: parsedContext,
      })

      setSuccessMessage(`Sent to ${recipientList.length} recipients`)
      setFormData({
        template_id: '',
        recipients: '',
        contextText: '{}',
      })
      setConfirmDialog(false)
      setLocalError('')

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary-100 p-3 dark:bg-primary-900/30">
          <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Bulk Messenger
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Send template-driven notifications to multiple recipients.
          </p>
        </div>
      </div>

      {(error || localError) && (
        <div className="flex gap-3 rounded-lg border border-danger-200 bg-danger-50 p-4 dark:border-danger-800 dark:bg-danger-900/20">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-danger-600 dark:text-danger-400" />
          <div>
            <p className="font-medium text-danger-700 dark:text-danger-400">Error</p>
            <p className="text-sm text-danger-600 dark:text-danger-300">{localError || error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="flex gap-3 rounded-lg border border-success-200 bg-success-50 p-4 dark:border-success-800 dark:bg-success-900/20">
          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-success-600 dark:text-success-400" />
          <p className="text-sm text-success-700 dark:text-success-400">{successMessage}</p>
        </div>
      )}

      <div className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800/50">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-900 dark:text-white">
            Select Template *
          </label>
          <select
            name="template_id"
            value={formData.template_id}
            onChange={handleChange}
            className={cn(
              'w-full rounded-lg border px-4 py-2',
              'border-neutral-300 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-primary-500'
            )}
          >
            <option value="">Choose a template...</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-neutral-900 dark:text-white">
              Recipients *
            </label>
            {recipientList.length > 0 && (
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                {recipientList.length} valid recipients
              </span>
            )}
          </div>
          <textarea
            name="recipients"
            value={formData.recipients}
            onChange={handleChange}
            placeholder={recipientHint}
            rows={6}
            className={cn(
              'w-full rounded-lg border px-4 py-2 font-mono text-sm',
              'border-neutral-300 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-primary-500'
            )}
          />
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{recipientHint}</p>
          {formData.recipients && recipientList.length === 0 && (
            <p className="mt-2 text-xs text-danger-600 dark:text-danger-400">
              No valid recipients found for the selected template type.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-900 dark:text-white">
            Additional Context (JSON)
          </label>
          <textarea
            name="contextText"
            value={formData.contextText}
            onChange={handleChange}
            placeholder='{"key": "value"}'
            rows={4}
            className={cn(
              'w-full rounded-lg border px-4 py-2 font-mono text-sm',
              'border-neutral-300 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-primary-500'
            )}
          />
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            This will send to {recipientList.length} recipients.
          </p>
          <button
            onClick={() => setConfirmDialog(true)}
            disabled={!formData.template_id || recipientList.length === 0 || isSending}
            className={cn(
              'flex items-center gap-2 rounded-lg px-6 py-2 font-medium text-white transition',
              isSending ? 'cursor-not-allowed bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'
            )}
          >
            <Send className="h-4 w-4" />
            {isSending ? 'Sending...' : 'Send Bulk Message'}
          </button>
        </div>
      </div>

      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 dark:bg-neutral-800">
            <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
              Confirm Bulk Send
            </h3>
            <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
              Send this message to {recipientList.length} recipients?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(false)}
                className="rounded-lg border border-neutral-200 px-4 py-2 font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition',
                  isSending ? 'cursor-not-allowed bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'
                )}
              >
                <Send className="h-4 w-4" />
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BulkMessenger
