// frontend/src/components/customers/RiskIndicator.jsx
import React from 'react';
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const RiskIndicator = ({ riskLevel, score = null, showLabel = true, size = 'medium' }) => {
  const getRiskConfig = () => {
    switch (riskLevel?.toUpperCase()) {
      case 'LOW':
        return {
          color: 'green',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300',
          icon: ShieldCheckIcon,
          label: 'Low Risk',
          description: 'Low probability of default'
        };
      case 'MEDIUM':
        return {
          color: 'yellow',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300',
          icon: ShieldExclamationIcon,
          label: 'Medium Risk',
          description: 'Moderate probability of default'
        };
      case 'HIGH':
        return {
          color: 'red',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300',
          icon: ExclamationTriangleIcon,
          label: 'High Risk',
          description: 'High probability of default'
        };
      default:
        return {
          color: 'gray',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300',
          icon: ShieldExclamationIcon,
          label: 'Unknown',
          description: 'Risk level not assessed'
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  };

  return (
    <div className="flex items-center">
      <div className={`inline-flex items-center ${sizeClasses[size]} rounded-full border ${config.borderColor} ${config.bgColor} ${config.textColor}`}>
        <Icon className={`${iconSizes[size]} mr-1.5`} />
        {showLabel && config.label}
        {score !== null && (
          <span className="ml-1.5 font-semibold">
            {score}
          </span>
        )}
      </div>
    </div>
  );
};

export default RiskIndicator;