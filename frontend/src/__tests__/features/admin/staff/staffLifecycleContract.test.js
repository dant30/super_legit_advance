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

import { staffAPI } from '../../../../features/admin/dashboard/services/admin'

describe('staff lifecycle API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches staff lists and detail from staff-profile endpoints', async () => {
    axiosMock.get
      .mockResolvedValueOnce({ data: { count: 1, results: [{ id: 'staff-1' }] } })
      .mockResolvedValueOnce({ data: { id: 'staff-1', employee_id: 'EMP-001' } })

    const list = await staffAPI.getStaff({ page: 1, search: 'EMP-001' })
    const detail = await staffAPI.getStaffById('staff-1')

    expect(list.count).toBe(1)
    expect(detail.employee_id).toBe('EMP-001')
    expect(axiosMock.get).toHaveBeenNthCalledWith(1, '/users/staff-profiles/', {
      params: { page: 1, search: 'EMP-001' },
    })
    expect(axiosMock.get).toHaveBeenNthCalledWith(2, '/users/staff-profiles/staff-1/')
  })

  it('creates, updates, assigns supervisor and deletes via supported endpoints', async () => {
    axiosMock.post
      .mockResolvedValueOnce({ data: { id: 'staff-1' } })
      .mockResolvedValueOnce({ data: { id: 'staff-1', supervisor: 'user-2' } })
      .mockResolvedValueOnce({ data: { id: 'staff-1', performance_rating: '4.50' } })
    axiosMock.patch.mockResolvedValueOnce({ data: { id: 'staff-1', department: 'Risk' } })
    axiosMock.delete.mockResolvedValueOnce({ data: null })

    await staffAPI.createStaff({ user_id: 'user-1', employee_id: 'EMP-001' })
    await staffAPI.updateStaff('staff-1', { department: 'Risk' })
    await staffAPI.assignSupervisor('staff-1', 'user-2')
    await staffAPI.updateStaffPerformance('staff-1', { rating: '4.5' })
    await staffAPI.deleteStaff('staff-1')

    expect(axiosMock.post).toHaveBeenNthCalledWith(1, '/users/staff-profiles/', {
      user_id: 'user-1',
      employee_id: 'EMP-001',
    })
    expect(axiosMock.patch).toHaveBeenCalledWith('/users/staff-profiles/staff-1/', {
      department: 'Risk',
    })
    expect(axiosMock.post).toHaveBeenNthCalledWith(2, '/users/staff-profiles/staff-1/assign-supervisor/', {
      supervisor_id: 'user-2',
    })
    expect(axiosMock.post).toHaveBeenNthCalledWith(3, '/users/staff-profiles/staff-1/update-performance/', {
      rating: '4.5',
    })
    expect(axiosMock.delete).toHaveBeenCalledWith('/users/staff-profiles/staff-1/')
  })
})
