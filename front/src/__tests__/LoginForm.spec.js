import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import usersJSON from '../../../test-data/users.json'
import LoginForm from '../components/LoginForm'

describe('<LoginForm />', () => {
  test('clicking the login button calls the login handler once, with the credentials', () => {
    const testCredentials = {
      email: usersJSON.admin.email,
      password: usersJSON.admin.password
    }

    const mockHandler = jest.fn()

    render(<LoginForm loginUser={mockHandler}/>)

    userEvent.type(
      screen.getByLabelText('Email'),
      testCredentials.email,
    )

    userEvent.type(
      screen.getByLabelText('Password'),
      testCredentials.password,
    )

    userEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(screen.getByLabelText('Email')).toHaveValue('')
    expect(screen.getByLabelText('Password')).toHaveValue('')
    expect(mockHandler).toHaveBeenCalled()
    expect(mockHandler).toHaveBeenCalledWith(testCredentials)
  })
})
