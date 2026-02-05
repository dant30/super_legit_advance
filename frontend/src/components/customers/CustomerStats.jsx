// frontend/src/components/customers/CustomerStats.jsx
import React, { useState, useEffect } from 'react';
import { useCustomerContext } from '../../contexts/CustomerContext';
import {
  UserGroupIcon,
  UserIcon,
  UserMinusIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const CustomerStats = ({ timeRange = 'monthly' }) => {
  const { stats, getCustomerStats } = useCustomerContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      await getCustomerStats();
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load customer statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={loadStats}
          className="mt-3 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No statistics available</h3>
        <p className="mt-1 text-sm text-gray-500">Customer statistics will be displayed here.</p>
      </div>
    );
  }

  const { total_customers, active_customers, blacklisted_customers, monthly_registrations } = stats;

  // Prepare chart data
  const registrationData = monthly_registrations?.map(item => ({
    month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    registrations: item.count
  })) || [];

  const statusData = [
    { name: 'Active', value: active_customers || 0, color: '#10b981' },
    { name: 'Total', value: total_customers || 0, color: '#3b82f6' },
    { name: 'Blacklisted', value: blacklisted_customers || 0, color: '#ef4444' }
  ];

  const growthRate = registrationData.length > 1 
    ? ((registrationData[registrationData.length - 1]?.registrations || 0) - 
       (registrationData[0]?.registrations || 0)) / (registrationData[0]?.registrations || 1) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{total_customers || 0}</p>
              <p className="text-xs text-gray-500">All registered customers</p>
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{active_customers || 0}</p>
              <p className="text-xs text-gray-500">
                {total_customers ? `${((active_customers / total_customers) * 100).toFixed(1)}% of total` : '0% of total'}
              </p>
            </div>
          </div>
        </div>

        {/* Blacklisted Customers */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <UserMinusIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Blacklisted</p>
              <p className="text-2xl font-bold text-gray-900">{blacklisted_customers || 0}</p>
              <p className="text-xs text-gray-500">
                {total_customers ? `${((blacklisted_customers / total_customers) * 100).toFixed(1)}% of total` : '0% of total'}
              </p>
            </div>
          </div>
        </div>

        {/* Growth Rate */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className={`text-2xl font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Last 6 months</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Registration Trend</h3>
              <p className="text-sm text-gray-500">New customer registrations over time</p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Last 6 months
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={registrationData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="registrations" 
                  stroke="#3b82f6" 
                  fill="#93c5fd" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Status Distribution */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Status Distribution</h3>
              <p className="text-sm text-gray-500">Breakdown of customer statuses</p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem'
                  }}
                  formatter={(value) => [value, 'Customers']}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  fill={(entry) => entry.color}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Registration Table */}
      {registrationData.length > 0 && (
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Monthly Registration Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Registrations
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cumulative Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrationData.map((item, index) => {
                  const cumulative = registrationData
                    .slice(0, index + 1)
                    .reduce((sum, curr) => sum + curr.registrations, 0);
                  
                  const prevRegistrations = index > 0 ? registrationData[index - 1].registrations : 0;
                  const growth = prevRegistrations > 0 
                    ? ((item.registrations - prevRegistrations) / prevRegistrations * 100).toFixed(1)
                    : 0;

                  return (
                    <tr key={item.month} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.registrations}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cumulative}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {growth >= 0 ? '+' : ''}{growth}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {registrationData.reduce((sum, curr) => sum + curr.registrations, 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {total_customers || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerStats;