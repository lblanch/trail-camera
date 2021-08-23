import React from 'react'

const LoginForm = ({ loginUser }) => {
  const submitLoginForm = async (event) => {
    event.preventDefault()

    //event.target.email.value would not work when testing
    const { email, password } = event.target.elements
    const credentials = {
      email: email.value,
      password: password.value
    }

    email.value = ''
    password.value = ''

    await loginUser(credentials)
  }

  return (
    <form name="login-form" onSubmit={submitLoginForm}>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="text" placeholder="email" />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" placeholder="password" />
      <button name="login-button">
        Login
      </button>
    </form>
  )
}

export default LoginForm