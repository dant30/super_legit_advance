import React, { useState } from 'react'
import { Send, Users, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@utils/cn'

const BulkMessenger = ({
  templates = [],
  onSend,
  isSending = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    template_id: '',
    recipients: '',
    context: {},
  })

  const [confirmDialog, setConfirmDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  const recipientList = formData.recipients
    .split('\n')
    .map((r) => r.trim())
    .filter((r) => r && /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(r))

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSend = async () => {
    if (!formData.template_id || recipientList.length === 0) {
      return
    }

    try {
      await onSend({
        template_id: formData.template_id,
        recipients: recipientList,
        context: formData.context,
      })

      setSuccessMessage(`Sent to ${recipientList.length} recipients`)
      setFormData({
        template_id: '',
        recipients: '',
        context: {},
      })
      setConfirmDialog(false)

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Bulk Messenger
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Send notifications to multiple recipients at once
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-danger-700 dark:text-danger-400">Error</p>
            <p className="text-sm text-danger-600 dark:text-danger-300">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg flex gap-3">
          <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-success-700 dark:text-success-400">{successMessage}</p>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 space-y-6">
        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
            Select Template *
          </label>
          <select
            name="template_id"
            value={formData.template_id}
            onChange={handleChange}
            className={cn(
              'w-full px-4 py-2 rounded-lg border',
              'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white',
              'border-neutral-300 dark:border-neutral-700',
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

        {/* Recipients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-neutral-900 dark:text-white">
              Recipients (email addresses, one per line) *
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
            placeholder="john@example.com&#10;jane@example.com&#10;admin@example.com"
            rows={6}
            className={cn(
              'w-full px-4 py-2 rounded-lg border',
              'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white',
              'border-neutral-300 dark:border-neutral-700',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              'font-mono text-sm'
            )}
          />
          {formData.recipients && recipientList.length === 0 && (
            <p className="mt-2 text-xs text-danger-600 dark:text-danger-400">
              No valid email addresses found
            </p>
          )}
        </div>

        {/* Additional Context (if needed) */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
            Additional Context (JSON)
          </label>
          <textarea
            value={JSON.stringify(formData.context, null, 2)}
            onChange={(e) => {
              try {
                setFormData((prev) => ({
                  ...prev,
                  context: JSON.parse(e.target.value),
                }))
              } catch (e) {
                // Keep invalid JSON as is
              }
            }}
            placeholder='{"key": "value"}'
            rows={4}
            className={cn(
              'w-full px-4 py-2 rounded-lg border',
              'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white',
              'border-neutral-300 dark:border-neutral-700',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              'font-mono text-sm'
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            This will send to {recipientList.length} recipients
          </p>
          <button
            onClick={() => setConfirmDialog(true)}
            disabled={!formData.template_id || recipientList.length === 0 || isSending}
            className={cn(
              'px-6 py-2 rounded-lg font-medium text-white flex items-center gap-2 transition',
              isSending
                ? 'bg-primary-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
            )}
          >
            <Send className="h-4 w-4" />
            {isSending ? 'Sending...' : 'Send Bulk Message'}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Confirm Bulk Send
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Are you sure you want to send this message to {recipientList.length} recipients?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog(false)}
                className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2 transition',
                  isSending
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
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