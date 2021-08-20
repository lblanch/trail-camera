import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import LoginForm from '../components/LoginForm'

describe('<LoginForm />', () => {
  test('clicking the login button calls the login handler once, with the credentials', () => {
    const testCredentials = {
      email: 'person1@email.com',
      password: '123456789101112'
    }

    const mockHandler = jest.fn()

    const loginComponent = render(<LoginForm loginUser={mockHandler}/>)

    userEvent.type(
      loginComponent.getByLabelText('Email'),
      testCredentials.email,
    )

    userEvent.type(
      loginComponent.getByLabelText('Password'),
      testCredentials.password,
    )

    userEvent.click(loginComponent.getByRole('button', { name: 'Login' }))

    expect(mockHandler).toHaveBeenCalled()
    expect(mockHandler).toHaveBeenCalledWith(testCredentials)
  })
})
