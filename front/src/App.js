import React, { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import { Skeleton } from '@chakra-ui/react'

import LoginForm from './components/LoginForm'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Notification from './components/Notification'
import authServices from './services/auth'


const RequireAuth = ({ user }) => {
  const location = useLocation()

  if (user === null) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

const Root = ({ user, userLoading, logoutUser, message }) => (
  <>
    <Header loading={userLoading} user={user} logout={logoutUser} />
    <Notification message={message} />
    { userLoading
      ? <Skeleton height="50px" />
      : <Outlet />
    }
  </>
)

const App = () => {
  const [user, setUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [message, setMessage] = useState('')

  const errorHandler = useCallback((error) => {
    if(error.response) {
      if (error.response.status === 401) {
        console.log(error.response.data.error)
        setUser(null)
      } else {
        if (error.response.data.error)
          console.log(error.response.data.error)
        else
          console.log(error.response.data)
      }
    } else {
      console.log(error)
    }
  }, [])

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const responseUser = await authServices.auth()
        setUser(responseUser)
      } catch(error) {
        errorHandler(error)
      } finally {
        setUserLoading(false)
      }
    }

    fetchAuthData()
  }, [errorHandler])

  const loginUser = async (credentials) => {
    setUserLoading(true)
    try {
      const loggedUser = await authServices.login(credentials)
      setUser(loggedUser)
      setMessage('')
    } catch (error) {
      if (error.response.data.error)
        setMessage(error.response.data.error)
      else
        setMessage(error.response.data)
    } finally {
      setUserLoading(false)
    }
  }

  const logoutUser = async () => {
    try {
      await authServices.logout()
      setUser(null)
      setMessage('Logout successful')
    } catch (error) {
      if (error.response.data.error)
        setMessage(error.response.data.error)
      else
        setMessage(error.response.data)
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Root user={user} userLoading={userLoading} logoutUser={logoutUser} message={message} />}>
          <Route element={<RequireAuth user={user} />}>
            <Route index element={<Dashboard errorHandler={errorHandler} />} />
          </Route>
          <Route path="login" element={<LoginForm loginUser={loginUser} user={user} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
