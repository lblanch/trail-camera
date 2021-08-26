import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'

import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'
import Notification from './components/Notification'
import authServices from './services/auth'

const App = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const response = await authServices.auth()
        setUser(response)
      } catch(error) {
        if (error.response.data.error)
          console.log(error.response.data.error)
        else
          console.log(error.response.data)
      }
      setLoading(false)
    }

    fetchAuthData()
  }, [])

  const loginUser = async (credentials) => {
    try {
      const loggedUser = await authServices.login(credentials)
      setUser(loggedUser)
      setMessage('')
    } catch (error) {
      if (error.response.data.error)
        setMessage(error.response.data.error)
      else
        setMessage(error.response.data)
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
      <Notification message={message} />
      <Switch>
        <Route path="/login">
          { user === null
            ? <LoginForm loginUser={loginUser} />
            : <Redirect to="/dashboard" />
          }
        </Route>
        <Route path="/dashboard">
          { user === null && !loading
            ? <Redirect to="/login" />
            : <Dashboard user={user} loading={loading} logout={logoutUser}/>
          }
        </Route>
        <Route>
          { user === null && !loading
            ? <Redirect to="/login" />
            : <Redirect to="/dashboard" />
          }
        </Route>
      </Switch>
    </Router>
  )
}

export default App
