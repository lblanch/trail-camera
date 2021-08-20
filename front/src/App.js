import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'

import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'
import loginServices from './services/login'

const App = () => {
  const [user, setUser] = useState(null)

  const loginUser = async (credentials) => {
    try {
      const loggedUser = await loginServices.login(credentials)
      setUser(loggedUser)
    } catch (error) {
      //show error
    }
  }

  return (
    <Router>
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
