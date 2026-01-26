import React from 'react'

interface DetailTableProps {
  title: string
  data: Record<string, any>[]
  expandable?: boolean
}

const DetailTable: React.FC<DetailTableProps> = ({ title, data, expandable = false }) => {
  const [expanded, setExpanded] = React.useState<number | null>(null)

  return (
    <div className="space-y-2">
      {data.map((item, idx) => (
        <div
          key={idx}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <div
            className="p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
            onClick={() => expandable && setExpanded(expanded === idx ? null : idx)}
          >
            <span className="font-medium">{Object.values(item)[0]}</span>
            {expandable && <span>{expanded === idx ? '−' : '+'}</span>}
          </div>
          {expandable && expanded === idx && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {Object.entries(item).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1">
                  <span className="text-gray-600 dark:text-gray-400">{key}</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default DetailTable