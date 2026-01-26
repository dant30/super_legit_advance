import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'

interface StaffFilterProps {
  value: string
  onChange: (officer: string) => void
}

const StaffFilter: React.FC<StaffFilterProps> = ({ value, onChange }) => {
  const { data: staff } = useQuery({
    queryKey: ['staffList'],
    queryFn: async () => {
      const response = await axiosInstance.get('/users/staff/')
      return response.data.results || []
    },
  })

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    >
      <option value="">All Staff</option>
      {staff?.map((member: any) => (
        <option key={member.id} value={member.id}>
          {member.user?.first_name} {member.user?.last_name}
        </option>
      ))}
    </select>
  )
}

export default StaffFilter