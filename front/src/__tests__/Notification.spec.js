import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Notification from '../components/Notification'

describe('<Notification />', () => {
  test('when passed a non empty message, shows a div with that message', () => {
    const message = 'This message is not empty'
    const { container } = render(<Notification message={message}/>)

    expect(screen.getByText(message)).toBeInTheDocument()
    expect(container).not.toBeEmptyDOMElement()
  })

  test('when passed an empty message, does not show anything', () => {
    const message = ''
    const { container } = render(<Notification message={message}/>)

    expect(container).toBeEmptyDOMElement()
  })

  test('when passed null message, does not show anything', () => {
    const message = null
    const { container } = render(<Notification message={message}/>)

    expect(container).toBeEmptyDOMElement()
  })
})
