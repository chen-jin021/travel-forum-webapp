import React from 'react'
import { MainView, SignUpView, LogInView } from './components'
import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { PersonalInfo } from './components/PersonalInfo'
import { PrivateRoute } from './components/PrivateRoute'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          <PrivateRoute path={'/main'} component={MainView} />
          <Route path="/signup" component={SignUpView} />
          <Route exact path="/" component={LogInView} />
          <PrivateRoute path="/personalInfo" component={PersonalInfo} />
        </Switch>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
