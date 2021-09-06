import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'

import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'
import Notification from './components/Notification'
import authServices from './services/auth'
import recordingsServices from './services/recordings'

const App = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [recordings, setRecordings] = useState([])
  //const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const responseUser = await authServices.auth()
        setUser(responseUser)
        if (responseUser !== null) {
          const responseRecordings = await recordingsServices.getInitialRecordings()
          if (responseRecordings.count !== 0) {
            setRecordings(responseRecordings.recordings)
          } else {
            setRecordings([])
          }
        }
      } catch(error) {
        if(error.response) {
          if (error.response.data.error)
            console.log(error.response.data.error)
          else
            console.log(error.response.data)
        } else {
          console.log(error)
        }
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
            : <Dashboard user={user} loading={loading} logout={logoutUser} recordings={recordings}/>
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
