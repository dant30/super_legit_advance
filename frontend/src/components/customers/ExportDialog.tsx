// frontend/src/components/customers/ExportDialog.tsx
import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { CUSTOMER_STATUS_OPTIONS, GENDER_OPTIONS, RISK_LEVEL_OPTIONS } from '@/types/customers'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (format: 'excel' | 'csv', filters?: any) => Promise<void>
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  onExport
}) => {
  const [format, setFormat] = useState<'excel' | 'csv'>('excel')
  const [filters, setFilters] = useState({
    status: '',
    gender: '',
    risk_level: '',
    start_date: '',
    end_date: ''
  })
  const [exporting, setExporting] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await onExport(format, filters)
      onOpenChange(false)
    } finally {
      setExporting(false)
    }
  }

  const hasFilters = Object.values(filters).some(value => value !== '')

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Export Customers"
      size="lg"
    >
      <div className="space-y-6">
        {/* Export Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <RadioGroup
            value={format}
            onValueChange={(value) => setFormat(value as 'excel' | 'csv')}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excel" id="excel" />
              <Label htmlFor="excel">
                Excel (.xlsx)
                <span className="text-xs text-gray-500 block">Recommended for reports</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv">
                CSV (.csv)
                <span className="text-xs text-gray-500 block">Simple spreadsheet format</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Filters */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Filters (Optional)
            </label>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({
                  status: '',
                  gender: '',
                  risk_level: '',
                  start_date: '',
                  end_date: ''
                })}
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <Select
                options={CUSTOMER_STATUS_OPTIONS}
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
                placeholder="All Statuses"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Gender</label>
              <Select
                options={GENDER_OPTIONS}
                value={filters.gender}
                onValueChange={(value) => handleFilterChange('gender', value)}
                placeholder="All Genders"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Risk Level</label>
              <Select
                options={RISK_LEVEL_OPTIONS}
                value={filters.risk_level}
                onValueChange={(value) => handleFilterChange('risk_level', value)}
                placeholder="All Risk Levels"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date Range</label>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  placeholder="Start Date"
                />
                <Input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Export Fields Info */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Export includes the following fields:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              'Customer Number', 'Full Name', 'ID Number', 'Phone', 'Email',
              'Date of Birth', 'Gender', 'Marital Status', 'Address',
              'County', 'Status', 'Credit Score', 'Risk Level',
              'Registration Date', 'Total Loans', 'Active Loans',
              'Outstanding Balance'
            ].map((field) => (
              <div key={field} className="text-xs text-gray-600">
                • {field}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export Customers'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

//export default ExportDialog