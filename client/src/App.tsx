import React from 'react'
import { MainView, SignUpView, LogInView } from './components'
import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter, Switch, Route } from 'react-router-dom'


const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          <Route path={'/main'} component = {MainView} />
          <Route path="/signup" component={SignUpView} />
          <Route exact path="/" component={LogInView}/>
        </Switch>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
