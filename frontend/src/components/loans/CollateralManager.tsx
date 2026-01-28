import { useState } from 'react'
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useLoans } from '@/hooks/useLoans'
import Loading from '@/components/shared/Loading'

interface CollateralManagerProps {
  loanId: number
  readOnly?: boolean
}

export default function CollateralManager({ loanId, readOnly = false }: CollateralManagerProps) {
  const { collaterals, getCollaterals, createCollateral, updateCollateral, deleteCollateral } =
    useLoans()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    collateral_type: '',
    description: '',
    owner_name: '',
    owner_id_number: '',
    ownership_type: '',
    estimated_value: 0,
    insured_value: 0,
    insurance_company: '',
    insurance_policy_number: '',
    insurance_expiry: '',
    location: '',
    registration_number: '',
    registration_date: '',
    registration_authority: '',
    notes: '',
  })

  useState(() => {
    loadCollaterals()
  }, [])

  const loadCollaterals = async () => {
    setLoading(true)
    try {
      await getCollaterals(loanId)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCollateral = async () => {
    setLoading(true)
    try {
      if (editing) {
        await updateCollateral(editing, formData)
        setEditing(null)
      } else {
        await createCollateral(loanId, formData)
      }
      setFormData({
        collateral_type: '',
        description: '',
        owner_name: '',
        owner_id_number: '',
        ownership_type: '',
        estimated_value: 0,
        insured_value: 0,
        insurance_company: '',
        insurance_policy_number: '',
        insurance_expiry: '',
        location: '',
        registration_number: '',
        registration_date: '',
        registration_authority: '',
        notes: '',
      })
      setShowForm(false)
      await loadCollaterals()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this collateral?')) {
      setLoading(true)
      try {
        await deleteCollateral(id)
        await loadCollaterals()
      } finally {
        setLoading(false)
      }
    }
  }

  const getCollateralStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'RELEASED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      case 'FORECLOSED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    }
  }

  if (loading && collaterals.length === 0) {
    return <Loading size="sm" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Collaterals</h3>
        {!readOnly && (
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Collateral
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && !readOnly && (
        <Card className="p-6 bg-gray-50 dark:bg-gray-800/50">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            {editing ? 'Edit Collateral' : 'Add New Collateral'}
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Collateral Type
              </label>
              <select
                value={formData.collateral_type}
                onChange={(e) => setFormData({ ...formData, collateral_type: e.target.value })}
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
              label="Owner Name"
              value={formData.owner_name}
              onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              placeholder="John Doe"
            />

            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description"
            />

            <Input
              label="Estimated Value (KES)"
              type="number"
              value={formData.estimated_value}
              onChange={(e) => setFormData({ ...formData, estimated_value: Number(e.target.value) })}
              placeholder="0"
            />

            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Physical location"
            />

            <Input
              label="Insurance Company"
              value={formData.insurance_company}
              onChange={(e) => setFormData({ ...formData, insurance_company: e.target.value })}
              placeholder="Insurance provider"
            />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Button onClick={handleAddCollateral} disabled={loading}>
              {loading ? 'Saving...' : editing ? 'Update' : 'Add'}
            </Button>
            <Button
              onClick={() => {
                setShowForm(false)
                setEditing(null)
              }}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Collaterals List */}
      <div className="space-y-3">
        {collaterals && collaterals.length > 0 ? (
          collaterals.map((collateral) => (
            <Card key={collateral.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {collateral.collateral_type}
                    </h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getCollateralStatusColor(
                        collateral.status
                      )}`}
                    >
                      {collateral.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {collateral.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Owner:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {collateral.owner_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Estimated Value:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        KES {collateral.estimated_value.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Location:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {collateral.location}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">LTV Ratio:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {collateral.loan_to_value_ratio.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  {collateral.is_insured && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-800 dark:text-green-300">
                      ✓ Insured with {collateral.insurance_company}
                    </div>
                  )}
                </div>
                {!readOnly && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditing(collateral.id)
                        setShowForm(true)
                        // Load data to edit form
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                      <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(collateral.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">No collaterals added yet</p>
          </Card>
        )}
      </div>
    </div>
  )
}