import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import usersJSON from '../../../test-data/users.json'
import Header from '../components/Header'

describe('<Header />', () => {
  test('shows skeleton while loading data and user is null', () => {
    render(<Header user={null} loading={true} />)
    expect(screen.queryByText('TrailCam')).toBeNull()
  })

  test('shows skeleton while loading data even if user is not null', () => {
    const user = { name: usersJSON.admin.name, email: usersJSON.admin.email, role: usersJSON.admin.role }
    render(<Header user={user} loading={true} />)
    expect(screen.queryByText('TrailCam')).toBeNull()
    expect(screen.queryByText(user.name)).toBeNull()
  })

  test('shows header without name when loading is false but user is null', () => {
    render(<Header user={null} loading={false} />)
    expect(screen.queryByText('TrailCam')).toBeVisible()
  })

  test('shows header with user\'s name when loading is false and user is not null', () => {
    const user = { name: usersJSON.admin.name, email: usersJSON.admin.email, role: usersJSON.admin.role }
    render(<Header user={user} loading={false} />)
    expect(screen.queryByText('TrailCam')).toBeVisible()
    expect(screen.queryByText(user.name)).toBeVisible()
    expect(screen.getByRole('button', { name: user.name })).toBeVisible()
  })

  test('when user\'s avatar is clicked, menu opens', async () => {
    const user = { name: usersJSON.admin.name, email: usersJSON.admin.email, role: usersJSON.admin.role }
    render(<Header user={user} loading={false} />)

    expect(screen.getByText('Profile')).not.toBeVisible()
    expect(screen.getByText('Settings')).not.toBeVisible()
    expect(screen.getByText('Logout')).not.toBeVisible()

    userEvent.click(screen.getByRole('button', { name: user.name }))

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeVisible()
    })

    expect(screen.getByText('Profile')).toBeVisible()
    expect(screen.getByText('Settings')).toBeVisible()
    expect(screen.getByText('Logout')).toBeVisible()
  })

  test('when clicking logout on the user\'s menu, it calls the logout handler function', async () => {
    const user = { name: usersJSON.admin.name, email: usersJSON.admin.email, role: usersJSON.admin.role }
    const mockHandler = jest.fn()

    render(<Header user={user} loading={false} logout={mockHandler} />)

    userEvent.click(screen.getByRole('button', { name: user.name }))

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeVisible()
    })

    userEvent.click(screen.getByText('Logout'))

    expect(mockHandler).toHaveBeenCalled()
  })
})
