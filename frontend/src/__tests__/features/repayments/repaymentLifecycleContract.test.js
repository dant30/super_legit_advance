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

import { repaymentsAPI, REPAYMENT_ENDPOINTS } from '../../../features/repayments/services/repayments'

describe('repayment lifecycle API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates, retrieves and updates repayment with expected endpoints', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: { id: 'rep-1', status: 'PENDING' } })
    axiosMock.get.mockResolvedValueOnce({ data: { id: 'rep-1' } })
    axiosMock.patch.mockResolvedValueOnce({ data: { id: 'rep-1', notes: 'updated' } })

    const created = await repaymentsAPI.createRepayment({ loan: 'loan-1', amount_due: 2500 })
    const detail = await repaymentsAPI.getRepayment('rep-1')
    const updated = await repaymentsAPI.updateRepayment('rep-1', { notes: 'updated' })

    expect(created.id).toBe('rep-1')
    expect(detail.id).toBe('rep-1')
    expect(updated.notes).toBe('updated')
    expect(axiosMock.post).toHaveBeenCalledWith(
      REPAYMENT_ENDPOINTS.create,
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    )
    expect(axiosMock.get).toHaveBeenCalledWith(REPAYMENT_ENDPOINTS.detail('rep-1'))
    expect(axiosMock.patch).toHaveBeenCalledWith(REPAYMENT_ENDPOINTS.detail('rep-1'), {
      notes: 'updated',
    })
  })

  it('uses lifecycle action endpoints for process, waive and cancel', async () => {
    axiosMock.post
      .mockResolvedValueOnce({ data: { message: 'processed' } })
      .mockResolvedValueOnce({ data: { message: 'waived' } })
      .mockResolvedValueOnce({ data: { message: 'cancelled' } })

    await repaymentsAPI.processRepayment('rep-1', { amount: 1200 })
    await repaymentsAPI.waiveRepayment('rep-1', { amount: 200, reason: 'policy' })
    await repaymentsAPI.cancelRepayment('rep-2', { reason: 'request' })

    expect(axiosMock.post).toHaveBeenNthCalledWith(1, REPAYMENT_ENDPOINTS.process('rep-1'), { amount: 1200 })
    expect(axiosMock.post).toHaveBeenNthCalledWith(2, REPAYMENT_ENDPOINTS.waive('rep-1'), {
      amount: 200,
      reason: 'policy',
    })
    expect(axiosMock.post).toHaveBeenNthCalledWith(3, REPAYMENT_ENDPOINTS.cancel('rep-2'), {
      reason: 'request',
    })
  })

  it('uses customer and loan repayment UUID endpoints', async () => {
    axiosMock.get.mockResolvedValue({ data: { results: [] } })

    await repaymentsAPI.getCustomerRepayments('cus-uuid-1')
    await repaymentsAPI.getLoanRepayments('loan-uuid-1')

    expect(axiosMock.get).toHaveBeenNthCalledWith(1, REPAYMENT_ENDPOINTS.customerRepayments('cus-uuid-1'), {
      params: {},
    })
    expect(axiosMock.get).toHaveBeenNthCalledWith(2, REPAYMENT_ENDPOINTS.loanRepayments('loan-uuid-1'), {
      params: {},
    })
  })
})
