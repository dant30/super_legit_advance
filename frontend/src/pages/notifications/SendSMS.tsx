import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

interface SendSMSForm {
  recipient: string
  message: string
  schedule?: string
}

export default function SendSMS() {
  const { register, handleSubmit, watch } = useForm<SendSMSForm>()
  const [isLoading, setIsLoading] = useState(false)
  const message = watch('message') || ''

  const onSubmit = async (data: SendSMSForm) => {
    setIsLoading(true)
    try {
      // API call would go here
      toast.success('SMS sent successfully')
    } catch (error) {
      toast.error('Failed to send SMS')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Send SMS | Super Legit Advance</title>
      </Helmet>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Send SMS
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Send SMS notifications to customers
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="p-6 space-y-4">
            <Input
              label="Recipient"
              placeholder="Customer phone number or group"
              {...register('recipient', { required: 'Recipient is required' })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Message ({message.length}/160 characters)
              </label>
              <textarea
                {...register('message', { required: 'Message is required' })}
                placeholder="Type your message here..."
                maxLength={160}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Schedule (Optional)
              </label>
              <input
                type="datetime-local"
                {...register('schedule')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Sending...' : 'Send SMS'}
            </Button>
          </Card>
        </form>
      </div>
    </>
  )
}