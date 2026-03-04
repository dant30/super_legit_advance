// frontend/src/components/repayments/RepaymentFilters.jsx
import React, { useEffect, useState } from 'react'
import { Card } from '@components/ui/Card'
import Input from '@components/ui/Input'
import Select from '@components/ui/Select'
import Button from '@components/ui/Button'
import { cn } from '@utils/cn'
import {
  REPAYMENT_STATUS,
  PAYMENT_METHOD,
  REPAYMENT_TYPE,
} from '@api/repayments'

const statusOptions = [
  { value: REPAYMENT_STATUS.PENDING, label: 'Pending' },
  { value: REPAYMENT_STATUS.PARTIAL, label: 'Partial' },
  { value: REPAYMENT_STATUS.COMPLETED, label: 'Completed' },
  { value: REPAYMENT_STATUS.OVERDUE, label: 'Overdue' },
  { value: REPAYMENT_STATUS.CANCELLED, label: 'Cancelled' },
  { value: REPAYMENT_STATUS.WAIVED, label: 'Waived' },
]

const methodOptions = [
  { value: PAYMENT_METHOD.CASH, label: 'Cash' },
  { value: PAYMENT_METHOD.MPESA, label: 'M-Pesa' },
  { value: PAYMENT_METHOD.BANK, label: 'Bank' },
  { value: PAYMENT_METHOD.CHEQUE, label: 'Cheque' },
]

const typeOptions = [
  { value: REPAYMENT_TYPE.FULL, label: 'Full' },
  { value: REPAYMENT_TYPE.PARTIAL, label: 'Partial' },
  { value: REPAYMENT_TYPE.INTEREST_ONLY, label: 'Interest Only' },
]

const RepaymentFilters = ({ value, onChange, onApply, onReset, className }) => {
  const [local, setLocal] = useState({
    search: '',
    status: '',
    payment_method: '',
    repayment_type: '',
    start_date: '',
    end_date: '',
    min_amount: '',
    max_amount: '',
  })

  useEffect(() => {
    if (value) setLocal((prev) => ({ ...prev, ...value }))
  }, [value])

  const update = (key, val) => {
    const next = { ...local, [key]: val }
    setLocal(next)
    onChange?.(next)
  }

  const handleApply = () => onApply?.(local)

  const handleReset = () => {
    const next = {
      search: '',
      status: '',
      payment_method: '',
      repayment_type: '',
      start_date: '',
      end_date: '',
      min_amount: '',
      max_amount: '',
    }
    setLocal(next)
    onReset?.(next)
  }

  return (
    <Card className={cn('p-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="Search"
          placeholder="Repayment number, customer, loan"
          value={local.search}
          onChange={(e) => update('search', e.target.value)}
        />
        <Select
          label="Status"
          options={statusOptions}
          value={local.status}
          onValueChange={(v) => update('status', v)}
          placeholder="All"
        />
        <Select
          label="Payment Method"
          options={methodOptions}
          value={local.payment_method}
          onValueChange={(v) => update('payment_method', v)}
          placeholder="All"
        />
        <Select
          label="Repayment Type"
          options={typeOptions}
          value={local.repayment_type}
          onValueChange={(v) => update('repayment_type', v)}
          placeholder="All"
        />
        <Input
          label="Start Date"
          type="date"
          value={local.start_date}
          onChange={(e) => update('start_date', e.target.value)}
        />
        <Input
          label="End Date"
          type="date"
          value={local.end_date}
          onChange={(e) => update('end_date', e.target.value)}
        />
        <Input
          label="Min Amount"
          type="number"
          value={local.min_amount}
          onChange={(e) => update('min_amount', e.target.value)}
        />
        <Input
          label="Max Amount"
          type="number"
          value={local.max_amount}
          onChange={(e) => update('max_amount', e.target.value)}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        <Button variant="outline" onClick={handleReset} size="sm">
          Reset
        </Button>
        <Button onClick={handleApply} size="sm">
          Apply Filters
        </Button>
      </div>
    </Card>
  )
}

export default RepaymentFilters
