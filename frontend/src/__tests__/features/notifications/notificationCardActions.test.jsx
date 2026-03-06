import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import NotificationCard from '../../../features/notifications/components/NotificationCard'

describe('NotificationCard lifecycle actions', () => {
  const baseNotification = {
    id: 'notif-1',
    title: 'Payment reminder',
    message: 'Please pay before due date',
    status: 'SENT',
    notification_type: 'PAYMENT_REMINDER',
    created_at: '2026-03-05T10:00:00Z',
    read_at: null,
    priority: 'MEDIUM',
    channel: 'IN_APP',
  }

  it('shows and triggers mark-as-read for unread notifications', () => {
    const onMarkAsRead = vi.fn()
    render(
      <NotificationCard
        notification={baseNotification}
        onMarkAsRead={onMarkAsRead}
        onDelete={() => {}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }))
    expect(onMarkAsRead).toHaveBeenCalledWith('notif-1')
  })

  it('hides mark-as-read for already read notifications', () => {
    render(
      <NotificationCard
        notification={{ ...baseNotification, status: 'READ', read_at: '2026-03-05T10:01:00Z' }}
        onMarkAsRead={() => {}}
        onDelete={() => {}}
      />
    )

    expect(screen.queryByRole('button', { name: 'Mark as read' })).toBeNull()
  })

  it('shows delete button on hover and triggers delete callback', () => {
    const onDelete = vi.fn()
    const { container } = render(
      <NotificationCard
        notification={baseNotification}
        onMarkAsRead={() => {}}
        onDelete={onDelete}
        isCompact
      />
    )

    const card = container.firstChild
    fireEvent.mouseEnter(card)
    fireEvent.click(screen.getByTitle('Delete'))
    expect(onDelete).toHaveBeenCalledWith('notif-1')
  })

  it('shows send-now action for pending notifications', () => {
    const onSend = vi.fn()
    render(
      <NotificationCard
        notification={{ ...baseNotification, status: 'PENDING' }}
        onMarkAsRead={() => {}}
        onSend={onSend}
        onDelete={() => {}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Send now' }))
    expect(onSend).toHaveBeenCalledWith('notif-1')
  })
})
