// fronetend/src/components/ui/Result.jsx
import React from 'react'
import clsx from 'clsx'

const Result = ({ icon, title, subTitle, extra }) => {
  return (
    <div className="text-center py-12">
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}

      {title && (
        <h2 className="text-2xl font-semibold mb-2">
          {title}
        </h2>
      )}

      {subTitle && (
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          {subTitle}
        </p>
      )}

      {extra && (
        <div className="flex justify-center gap-3">
          {extra}
        </div>
      )}
    </div>
  )
}

export default Result