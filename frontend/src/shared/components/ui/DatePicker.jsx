// frontend/src/components/shared/DatePicker.jsx
import React, { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@utils/cn'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

// Initialize dayjs plugins
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const DatePicker = ({
  selectedDate,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  className,
  format = 'DD/MM/YYYY',
  showTime = false,
  timeFormat = 'HH:mm',
  error,
  label,
  required = false,
  clearable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [time, setTime] = useState(selectedDate ? dayjs(selectedDate).format('HH:mm') : '00:00')

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const handleDateSelect = (date) => {
    let newDate = date
    if (showTime && time) {
      const [hours, minutes] = time.split(':')
      newDate = newDate.hour(hours).minute(minutes)
    }
    
    if (minDate && newDate.isBefore(minDate, 'day')) return
    if (maxDate && newDate.isAfter(maxDate, 'day')) return
    
    onChange(newDate.toDate())
    if (!showTime) setIsOpen(false)
  }

  const handleTimeChange = (e) => {
    const newTime = e.target.value
    setTime(newTime)
    
    if (selectedDate) {
      const [hours, minutes] = newTime.split(':')
      const newDate = dayjs(selectedDate).hour(hours).minute(minutes)
      onChange(newDate.toDate())
    }
  }

  const handleClear = () => {
    onChange(null)
    setTime('00:00')
  }

  const getDaysInMonth = () => {
    const startOfMonth = currentMonth.startOf('month')
    const endOfMonth = currentMonth.endOf('month')
    
    const days = []
    const startDay = startOfMonth.day()
    
    // Previous month days
    for (let i = 0; i < startDay; i++) {
      const date = startOfMonth.subtract(startDay - i, 'day')
      days.push({
        date,
        isCurrentMonth: false,
        isDisabled: (minDate && date.isBefore(minDate, 'day')) || 
                    (maxDate && date.isAfter(maxDate, 'day'))
      })
    }
    
    // Current month days
    for (let i = 1; i <= endOfMonth.date(); i++) {
      const date = currentMonth.date(i)
      days.push({
        date,
        isCurrentMonth: true,
        isDisabled: (minDate && date.isBefore(minDate, 'day')) || 
                    (maxDate && date.isAfter(maxDate, 'day')) ||
                    disabled
      })
    }
    
    // Next month days
    const totalCells = 42 // 6 weeks * 7 days
    const remaining = totalCells - days.length
    for (let i = 1; i <= remaining; i++) {
      const date = endOfMonth.add(i, 'day')
      days.push({
        date,
        isCurrentMonth: false,
        isDisabled: (minDate && date.isBefore(minDate, 'day')) || 
                    (maxDate && date.isAfter(maxDate, 'day'))
      })
    }
    
    return days
  }

  const isSelected = (date) => {
    return selectedDate && dayjs(date).isSame(selectedDate, 'day')
  }

  const isToday = (date) => {
    return dayjs(date).isSame(dayjs(), 'day')
  }

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'flex-1 flex items-center justify-between gap-2 w-full px-3 py-2.5 text-left',
              'rounded-lg border border-gray-300 dark:border-slate-600',
              'bg-white dark:bg-slate-800 text-gray-900 dark:text-white',
              'focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/30',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-danger-500 dark:border-danger-400',
              className
            )}
          >
            <span className={cn(
              selectedDate ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            )}>
              {selectedDate 
                ? dayjs(selectedDate).format(format + (showTime ? ` ${timeFormat}` : ''))
                : placeholder
              }
            </span>
            <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          </button>
          
          {clearable && selectedDate && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2.5 text-gray-500 hover:text-danger-600 dark:text-gray-400 dark:hover:text-danger-400 transition-colors"
              title="Clear date"
            >
              Clear
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-medium w-full min-w-[300px]">
            {/* Month Navigation */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {currentMonth.format('MMMM YYYY')}
              </div>
              
              <button
                type="button"
                onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 px-4 py-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="text-xs font-medium text-center text-gray-500 dark:text-gray-400 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 px-4 pb-4">
              {getDaysInMonth().map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(day.date)}
                  disabled={day.isDisabled}
                  className={cn(
                    'h-9 w-9 rounded-full text-sm font-medium transition-colors',
                    'flex items-center justify-center',
                    isSelected(day.date) && 'bg-primary-600 text-white',
                    !isSelected(day.date) && !day.isCurrentMonth && 'text-gray-400 dark:text-gray-500',
                    !isSelected(day.date) && day.isCurrentMonth && 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700',
                    day.isDisabled && 'opacity-40 cursor-not-allowed',
                    isToday(day.date) && !isSelected(day.date) && 'border border-primary-500'
                  )}
                >
                  {day.date.date()}
                </button>
              ))}
            </div>

            {/* Time Picker */}
            {showTime && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={handleTimeChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
              </div>
            )}

            {/* Quick Actions */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700 flex justify-between">
              <button
                type="button"
                onClick={() => handleDateSelect(dayjs())}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{error}</p>
      )}
    </div>
  )
}

// Range Date Picker Component
export const DateRangePicker = ({ startDate, endDate, onChange, ...props }) => {
  const handleStartDateChange = (date) => {
    onChange({ startDate: date, endDate })
  }

  const handleEndDateChange = (date) => {
    onChange({ startDate, endDate: date })
  }

  return (
    <div className="flex items-center gap-3">
      <DatePicker
        selectedDate={startDate}
        onChange={handleStartDateChange}
        placeholder="Start date"
        maxDate={endDate}
        {...props}
      />
      <span className="text-gray-400 dark:text-gray-500">to</span>
      <DatePicker
        selectedDate={endDate}
        onChange={handleEndDateChange}
        placeholder="End date"
        minDate={startDate}
        {...props}
      />
    </div>
  )
}

export default DatePicker