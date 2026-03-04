// frontend/src/components/loans/CollateralForm.jsx
import React, { useState } from 'react'
import { Button, Card } from '@components/ui'

const CollateralForm = ({ onSubmit, submitting = false }) => {
  const [values, setValues] = useState({
    collateral_type: '',
    description: '',
    estimated_value: '',
    owner_name: '',
    ownership_type: '',
    registration_number: '',
  })

  const handleChange = (key) => (e) => {
    setValues(prev => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(values)
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-900">Add Collateral</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600">Collateral Type</label>
          <input className="mt-1 w-full rounded-md border-gray-300 text-sm" value={values.collateral_type} onChange={handleChange('collateral_type')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Description</label>
          <textarea className="mt-1 w-full rounded-md border-gray-300 text-sm" rows={3} value={values.description} onChange={handleChange('description')} />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600">Estimated Value</label>
            <input className="mt-1 w-full rounded-md border-gray-300 text-sm" type="number" value={values.estimated_value} onChange={handleChange('estimated_value')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Owner Name</label>
            <input className="mt-1 w-full rounded-md border-gray-300 text-sm" value={values.owner_name} onChange={handleChange('owner_name')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Ownership Type</label>
            <input className="mt-1 w-full rounded-md border-gray-300 text-sm" value={values.ownership_type} onChange={handleChange('ownership_type')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Registration Number</label>
            <input className="mt-1 w-full rounded-md border-gray-300 text-sm" value={values.registration_number} onChange={handleChange('registration_number')} />
          </div>
        </div>
        <Button type="primary" htmlType="submit" loading={submitting}>
          Save Collateral
        </Button>
      </form>
    </Card>
  )
}

export default CollateralForm
