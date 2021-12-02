import React, { useState, useEffect, useCallback } from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import { Skeleton } from '@chakra-ui/react'

import LoginForm from './components/LoginForm'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Recording from './components/Recording'
import Notification from './components/Notification'
import authServices from './services/auth'

const AppSwitch = ({ user, loginUser, errorHandler }) => (
  <Switch>
    <Route path="/login">
      { user === null
        ? <LoginForm loginUser={loginUser} />
        : <Redirect to="/dashboard" />
      }
    </Route>
    <Route path="/dashboard/:recordingId">
      { user === null
        ? <Redirect to="/login" />
        : <Recording />
      }
    </Route>
    <Route path="/dashboard">
      { user === null
        ? <Redirect to="/login" />
        : <Dashboard errorHandler={errorHandler} />
      }
    </Route>
    <Route>
      { user === null
        ? <Redirect to="/login" />
        : <Redirect to="/dashboard" />
      }
    </Route>
  </Switch>
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
    <Router>
      <Header loading={userLoading} user={user} logout={logoutUser} />
      <Notification message={message} />
      { userLoading
        ? <Skeleton height="50px" />
        : <AppSwitch user={user} loginUser={loginUser} errorHandler={errorHandler} />
      }
    </Router>
  )
}

export default App
