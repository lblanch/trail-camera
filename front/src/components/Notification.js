import React from 'react'

const Notification = ({ message }) => {
  if (message === null || message.length === 0) {
    return null
  }

  return (
    <div name="notification">
      {message}
    </div>
  )
}

export default Notification