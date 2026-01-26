import React from 'react'
import Button from '@/components/ui/Button'
import { Download, FileText } from 'lucide-react'

interface ExportButtonsProps {
  onExport: (format: 'excel' | 'pdf') => void
  disabled?: boolean
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ onExport, disabled = false }) => {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => onExport('excel')}
        disabled={disabled}
        size="sm"
        variant="secondary"
      >
        <Download className="h-4 w-4 mr-2" />
        Excel
      </Button>
      <Button
        onClick={() => onExport('pdf')}
        disabled={disabled}
        size="sm"
        variant="secondary"
      >
        <FileText className="h-4 w-4 mr-2" />
        PDF
      </Button>
    </div>
  )
}

export default ExportButtons