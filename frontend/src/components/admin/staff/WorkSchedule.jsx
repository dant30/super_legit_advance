import React, { useState } from 'react'
import {
  Card,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Select,
  Space,
  Alert,
} from '@components/ui'
import { DatePicker } from '@components/shared'
import { Plus, Edit, Trash2, Bell } from 'lucide-react'
import dayjs from 'dayjs'

const WorkSchedule = ({ staffId, schedule = [], onAddShift, onDeleteShift, loading = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const shiftTypes = [
    { value: 'MORNING', label: 'Morning (8AM - 4PM)' },
    { value: 'AFTERNOON', label: 'Afternoon (4PM - 12AM)' },
    { value: 'NIGHT', label: 'Night (12AM - 8AM)' },
  ]

  const handleSubmit = async (values) => {
    try {
      await onAddShift?.({
        ...values,
        staff_id: staffId,
      })
      form.resetFields()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error adding shift:', error)
    }
  }

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('ddd, MMM DD'),
    },
    {
      title: 'Shift',
      dataIndex: 'shift_type',
      key: 'shift_type',
      render: (type) => (
        <Tag color="blue">
          {type === 'MORNING' && 'Morning (8AM - 4PM)'}
          {type === 'AFTERNOON' && 'Afternoon (4PM - 12AM)'}
          {type === 'NIGHT' && 'Night (12AM - 8AM)'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'CONFIRMED' ? 'success' : 'warning'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'id',
      key: 'actions',
      render: (id) => (
        <Space>
          <Button
            type="text"
            size="sm"
            icon={<Edit className="h-4 w-4" />}
          />
          <Button
            type="text"
            size="sm"
            danger
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => onDeleteShift?.(id)}
          />
        </Space>
      ),
    },
  ]

  return (
    <Card className="shadow-soft">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Work Schedule</h3>
          <Button
            type="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Shift
          </Button>
        </div>

        <Alert
          message="Manage staff work shifts and schedules"
          type="info"
          showIcon
        />

        <Table
          columns={columns}
          dataSource={schedule}
          loading={loading}
          rowKey="id"
          pagination={false}
        />

        <Modal
          title="Add Work Shift"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="mt-4"
          >
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: 'Date is required' }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              label="Shift"
              name="shift_type"
              rules={[{ required: true, message: 'Shift type is required' }]}
            >
              <Select options={shiftTypes} />
            </Form.Item>

            <Space className="w-full justify-end pt-4">
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Add Shift
              </Button>
            </Space>
          </Form>
        </Modal>
      </div>
    </Card>
  )
}

export default WorkSchedule