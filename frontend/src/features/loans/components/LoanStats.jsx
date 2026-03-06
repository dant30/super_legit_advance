// frontend/src/components/loans/LoanStats.jsx
import React from 'react'
import Card from '@components/ui/Card'
import Col from '@components/ui/Col'
import Row from '@components/ui/Row'
import Statistic from '@components/ui/Statistic'
import { formatCurrency } from '@api/loans'

const LoanStats = ({ stats }) => {
  const summary = stats?.summary || {}

  return (
    <Row gutter={16} className="mb-6">
      <Col span={6}>
        <Card>
          <Statistic title="Total Loans" value={summary.total_loans || 0} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Active Loans" value={summary.total_active_loans || 0} valueStyle={{ color: '#10b981' }} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Overdue Loans" value={summary.total_overdue_loans || 0} valueStyle={{ color: '#ef4444' }} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Outstanding" value={formatCurrency(summary.total_outstanding_balance || 0)} valueStyle={{ color: '#3b82f6' }} />
        </Card>
      </Col>
    </Row>
  )
}

export default LoanStats
