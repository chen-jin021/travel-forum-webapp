import React, { useState } from 'react'
import { MainView, SignUpView, LogInView, Square } from './components'
import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { PersonalInfo } from './components/PersonalInfo'
import { PrivateRoute } from './components/PrivateRoute'
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
  Autocomplete,
} from '@react-google-maps/api'

const App = () => {
  const { isLoaded } = useJsApiLoader({
    libraries: ['places'],
    language: 'en',
    googleMapsApiKey: 'AIzaSyDpeuDVOz47pLtmP8zFr6KsDDU7jEAs1Uo',
  })

  return (
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          <PrivateRoute isLoaded={isLoaded} path={'/main'} component={MainView} />
          <Route path="/signup" component={SignUpView} />
          <Route exact path="/" component={LogInView} />
          <PrivateRoute path="/personalInfo" component={PersonalInfo} />
          <PrivateRoute path="/square" isLoaded={isLoaded} component={Square} />
        </Switch>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
