import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
  Autocomplete,
} from '@react-google-maps/api'

export const PrivateRoute = ({ component: Component, isLoaded, ...rest }: any) => {
  const { user } = useAuth()
  return (
    <Route
      {...rest}
      render={(props) => {
        console.log(props)
        return user ? <Component isLoaded={isLoaded} {...props} /> : <Redirect to="/" />
      }}
    ></Route>
  )
}
