import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'

import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'
import Notification from './components/Notification'
import loginServices from './services/login'

const App = () => {
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')

  const loginUser = async (credentials) => {
    try {
      const loggedUser = await loginServices.login(credentials)
      setUser(loggedUser)
      setMessage('')
    } catch (error) {
      setMessage(error.response.data.error)
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
          { user === null
            ? <Redirect to="/login" />
            : <Dashboard name={user.name}/>
          }
        </Route>
        <Route>
          { user === null
            ? <Redirect to="/login" />
            : <Redirect to="/dashboard" />
          }
        </Route>
      </Switch>
    </Router>
  )
}

export default App
