import React, { useState } from 'react'
import { VStack, Input, InputGroup, InputRightElement, Button, FormLabel, FormControl } from '@chakra-ui/react'

const LoginForm = ({ loginUser }) => {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleShowPassword = () => {
    setShow(!show)
  }

  const submitLoginForm = async (event) => {
    setLoading(true)
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
    setLoading(false)
  }

  return (
    <VStack>
      <form name="login-form" onSubmit={submitLoginForm}>
        <FormControl id="email">
          <FormLabel>Email</FormLabel>
          <Input variant="outline" name="email" type="text" placeholder="Email" />
        </FormControl>
        <FormControl id="password">
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input variant="outline" name="password" type={show ? 'text' : 'password'} placeholder="Password" />
            <InputRightElement>
              <Button onClick={handleShowPassword}>
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        {loading ?
          <Button isLoading  loadingText="Logging in" variant="solid" name="login-button">Login</Button>
          : <Button variant="solid" name="login-button" type="submit">Login</Button>
        }
      </form>
    </VStack>
  )
}

export default LoginForm