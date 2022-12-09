import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export const PrivateRoute = ({ component: Component, ...rest }: any) => {
  const { user } = useAuth()
  return (
    <Route
      {...rest}
      render={(props) => {
        return user ? <Component {...props} /> : <Redirect to="/" />
      }}
    ></Route>
  )
}
