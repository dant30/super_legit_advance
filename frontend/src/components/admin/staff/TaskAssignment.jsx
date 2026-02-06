import React, { useState } from 'react'
import {
  Card,
  Button,
  Form,
  Input,
  Select,
  Modal,
  Table,
  Tag,
  Space,
  Badge,
  Popconfirm,
} from '@components/ui'
import { DatePicker } from '@components/shared'
import { Plus, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import dayjs from 'dayjs'

const priorityColors = {
  LOW: 'cyan',
  MEDIUM: 'orange',
  HIGH: 'red',
}

const statusColors = {
  PENDING: 'default',
  IN_PROGRESS: 'processing',
  COMPLETED: 'success',
  OVERDUE: 'error',
}

const TaskAssignment = ({ staffId, tasks = [], onAddTask, onDeleteTask, loading = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async (values) => {
    try {
      await onAddTask?.({
        ...values,
        staff_id: staffId,
        due_date: values.due_date?.format('YYYY-MM-DD'),
      })
      form.resetFields()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error assigning task:', error)
    }
  }

  const columns = [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <p className="font-medium">{text}</p>
          <p className="text-xs text-gray-500">{record.description}</p>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={priorityColors[priority]}>{priority}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>{status}</Tag>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      dataIndex: 'id',
      key: 'actions',
      render: (id) => (
        <Popconfirm
          title="Delete task?"
          description="This action cannot be undone"
          onConfirm={() => onDeleteTask?.(id)}
        >
          <Button type="text" danger icon={<Trash2 className="h-4 w-4" />} />
        </Popconfirm>
      ),
    },
  ]

  return (
    <Card className="shadow-soft">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Assigned Tasks</h3>
          <Badge count={tasks.length} />
        </div>

        <Button
          type="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Assign New Task
        </Button>

        <Table
          columns={columns}
          dataSource={tasks}
          loading={loading}
          rowKey="id"
          pagination={false}
        />

        <Modal
          title="Assign Task"
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
              label="Task Title"
              name="title"
              rules={[{ required: true, message: 'Title is required' }]}
            >
              <Input placeholder="Enter task title" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
            >
              <Input.TextArea
                placeholder="Enter task description"
                rows={3}
              />
            </Form.Item>

            <Form.Item
              label="Priority"
              name="priority"
              rules={[{ required: true, message: 'Priority is required' }]}
            >
              <Select
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Due Date"
              name="due_date"
              rules={[{ required: true, message: 'Due date is required' }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Space className="w-full justify-end pt-4">
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Assign Task
              </Button>
            </Space>
          </Form>
        </Modal>
      </div>
    </Card>
  )
}

export default TaskAssignment