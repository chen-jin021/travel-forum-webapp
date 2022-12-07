import React from 'react'
import { MainView, SignUpView, LogInView } from './components'
import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { PersonalInfo } from './components/PersonalInfo'


const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          <Route path={'/main'} component = {MainView} />
          <Route path="/signup" component={SignUpView} />
          <Route exact path="/" component={LogInView}/>
          <Route path="/personalInfo" component={PersonalInfo}/>
        </Switch>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
