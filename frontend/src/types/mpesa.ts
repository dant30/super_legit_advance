// frontend/src/types/mpesa.ts

export interface STKPushRequest {
  phone_number: string
  amount: number
  account_reference?: string
  description?: string
  customer_id?: number
  loan_id?: number
  repayment_id?: number
  payment_type?: 'LOAN_REPAYMENT' | 'LOAN_APPLICATION_FEE' | 'PENALTY_PAYMENT' | 'OTHER'
}

export interface MpesaPayment {
  id: number
  payment_reference: string
  customer?: {
    id: number
    full_name: string
    customer_number: string
  }
  loan?: {
    id: number
    loan_number: string
  }
  repayment?: {
    id: number
    repayment_number: string
  }
  phone_number: string
  amount: number
  description: string
  payment_type: string
  transaction_type: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED' | 'TIMEOUT'
  result_code?: number
  result_description?: string
  merchant_request_id?: string
  checkout_request_id?: string
  callback_metadata: Record<string, any>
  error_code?: string
  error_message?: string
  retry_count: number
  initiated_at: string
  processed_at?: string
  completed_at?: string
  processing_time?: number
  ip_address?: string
  user_agent?: string
  created_at: string
  updated_at: string
  
  // Computed fields
  formatted_amount: string
  is_successful: boolean
  is_pending: boolean
  is_failed: boolean
}

export interface MpesaTransaction {
  id: number
  transaction_id: string
  mpesa_receipt_number: string
  payment: {
    id: number
    payment_reference: string
  }
  amount: number
  phone_number: string
  transaction_date: string
  transaction_type: 'PAYMENT' | 'REVERSAL' | 'REFUND'
  status: 'COMPLETED' | 'REVERSED' | 'FAILED'
  account_reference?: string
  transaction_description?: string
  balance?: number
  conversation_id?: string
  originator_conversation_id?: string
  original_transaction_id?: string
  reversal_reason?: string
  reversed_at?: string
  raw_response: Record<string, any>
  created_at: string
  updated_at: string
  
  // Computed fields
  formatted_amount: string
  formatted_balance: string
  formatted_transaction_date: string
  is_reversed: boolean
}

export interface PaymentSummary {
  summary: {
    period_days: number
    start_date: string
    end_date: string
    payment_statistics: {
      total_payments: number
      successful_payments: number
      pending_payments: number
      failed_payments: number
      success_rate: number
    }
    amount_statistics: {
      total_amount: number
      successful_amount: number
      average_amount: number
      currency: string
    }
    transaction_statistics: {
      total_transactions: number
      reversed_transactions: number
    }
  }
  daily_statistics: Array<{
    date: string
    total_payments: number
    successful_payments: number
    total_amount: number
    successful_amount: number
  }>
  payment_type_distribution: Array<{
    type: string
    label: string
    total: number
    successful: number
    amount: number
  }>
  top_payments: MpesaPayment[]
  recent_transactions: MpesaTransaction[]
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface PaymentHistoryParams {
  customer_id?: number
  loan_id?: number
  start_date?: string
  end_date?: string
  status?: string
  payment_type?: string
  min_amount?: number
  max_amount?: number
  page?: number
  page_size?: number
}

export interface TransactionListParams {
  start_date?: string
  end_date?: string
  phone_number?: string
  receipt_number?: string
  status?: string
  transaction_type?: string
  page?: number
  page_size?: number
}

export interface PaymentRetryRequest {
  phone_number?: string
}

export interface PaymentReversalRequest {
  reason: string
}