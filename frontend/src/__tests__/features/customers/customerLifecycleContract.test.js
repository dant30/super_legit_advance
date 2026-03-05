import { beforeEach, describe, expect, it, vi } from 'vitest'

const { axiosMock } = vi.hoisted(() => ({
  axiosMock: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@api/axios', () => ({ default: axiosMock }))

import {
  createCustomer,
  getCustomer,
  updateCustomer,
  blacklistCustomer,
  activateCustomer,
  normalizeCustomerEntity,
} from '../../../features/customers/services/customers'

describe('customer lifecycle API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates, retrieves, and updates customer via expected endpoints', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: { id: 'cus-1', status: 'ACTIVE' } })
    axiosMock.get.mockResolvedValueOnce({ data: { id: 'cus-1', first_name: 'Mary' } })
    axiosMock.put.mockResolvedValueOnce({ data: { id: 'cus-1', last_name: 'Updated' } })

    const created = await createCustomer({ first_name: 'Mary' })
    const detail = await getCustomer('cus-1')
    const updated = await updateCustomer('cus-1', { last_name: 'Updated' })

    expect(created.success).toBe(true)
    expect(detail.success).toBe(true)
    expect(updated.success).toBe(true)
    expect(axiosMock.post).toHaveBeenCalledWith(
      '/customers/create/',
      expect.any(FormData),
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
    )
    expect(axiosMock.get).toHaveBeenCalledWith('/customers/cus-1/')
    expect(axiosMock.put).toHaveBeenCalledWith(
      '/customers/cus-1/',
      expect.any(FormData),
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
    )
  })

  it('blacklists and activates customer using lifecycle endpoints', async () => {
    axiosMock.post
      .mockResolvedValueOnce({
        data: {
          message: 'Customer blacklisted successfully',
          customer: { id: 'cus-1', status: 'BLACKLISTED' },
        },
      })
      .mockResolvedValueOnce({
        data: {
          message: 'Customer activated successfully',
          customer: { id: 'cus-1', status: 'ACTIVE' },
        },
      })

    const blacklisted = await blacklistCustomer('cus-1', 'Risk flagged')
    const activated = await activateCustomer('cus-1')

    expect(blacklisted.success).toBe(true)
    expect(activated.success).toBe(true)
    expect(axiosMock.post).toHaveBeenNthCalledWith(1, '/customers/cus-1/blacklist/', {
      reason: 'Risk flagged',
    })
    expect(axiosMock.post).toHaveBeenNthCalledWith(2, '/customers/cus-1/activate/')
  })

  it('normalizes wrapped customer payloads from lifecycle actions', () => {
    expect(
      normalizeCustomerEntity({
        message: 'ok',
        customer: { id: 'cus-1', status: 'BLACKLISTED' },
      })
    ).toEqual({ id: 'cus-1', status: 'BLACKLISTED' })

    expect(
      normalizeCustomerEntity({
        data: { customer: { id: 'cus-2', status: 'ACTIVE' } },
      })
    ).toEqual({ id: 'cus-2', status: 'ACTIVE' })
  })
})
