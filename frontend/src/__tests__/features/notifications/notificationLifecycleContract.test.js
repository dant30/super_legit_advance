import { beforeEach, describe, expect, it, vi } from 'vitest'

const { axiosMock } = vi.hoisted(() => ({
  axiosMock: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@api/axios', () => ({ default: axiosMock }))

import { notificationsAPI } from '../../../features/notifications/services/notifications'

describe('notifications lifecycle API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses expected lifecycle endpoints for list/create/send/read/delete', async () => {
    axiosMock.get.mockResolvedValueOnce({ data: { results: [], count: 0 } })
    axiosMock.post.mockResolvedValueOnce({ data: { id: 'n1' } })
    axiosMock.post.mockResolvedValueOnce({ data: { message: 'sent' } })
    axiosMock.patch.mockResolvedValueOnce({ data: { status: 'READ' } })
    axiosMock.post.mockResolvedValueOnce({ data: { marked_read: 3 } })
    axiosMock.delete.mockResolvedValueOnce({ data: {} })

    await notificationsAPI.getNotifications({ page: 1, page_size: 10 })
    await notificationsAPI.createNotification({ title: 'Hello' })
    await notificationsAPI.sendNotification('n1')
    await notificationsAPI.markAsRead('n1')
    await notificationsAPI.markAllAsRead()
    await notificationsAPI.deleteNotification('n1')

    expect(axiosMock.get).toHaveBeenNthCalledWith(1, '/notifications/notifications/', {
      params: { page: 1, page_size: 10 },
    })
    expect(axiosMock.post).toHaveBeenNthCalledWith(1, '/notifications/notifications/', { title: 'Hello' })
    expect(axiosMock.post).toHaveBeenNthCalledWith(2, '/notifications/notifications/n1/send/', {})
    expect(axiosMock.patch).toHaveBeenCalledWith('/notifications/notifications/n1/mark-read/')
    expect(axiosMock.post).toHaveBeenNthCalledWith(3, '/notifications/notifications/mark-all-read/')
    expect(axiosMock.delete).toHaveBeenCalledWith('/notifications/notifications/n1/')
  })

  it('uses stats/templates/sms endpoints exposed by backend notifications app', async () => {
    axiosMock.get
      .mockResolvedValueOnce({ data: { overall: {} } })
      .mockResolvedValueOnce({ data: { results: [] } })
      .mockResolvedValueOnce({ data: { results: [] } })
      .mockResolvedValueOnce({ data: { overall: {} } })

    await notificationsAPI.getStats({ days: 7 })
    await notificationsAPI.getTemplates({ active: true })
    await notificationsAPI.getSMSLogs({ page_size: 10 })
    await notificationsAPI.getSMSStats({ days: 30 })

    expect(axiosMock.get).toHaveBeenNthCalledWith(1, '/notifications/stats/', { params: { days: 7 } })
    expect(axiosMock.get).toHaveBeenNthCalledWith(2, '/notifications/templates/', { params: { active: true } })
    expect(axiosMock.get).toHaveBeenNthCalledWith(3, '/notifications/sms-logs/', { params: { page_size: 10 } })
    expect(axiosMock.get).toHaveBeenNthCalledWith(4, '/notifications/sms-logs/stats/', { params: { days: 30 } })
  })
})
