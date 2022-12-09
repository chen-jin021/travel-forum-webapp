import React, { useContext, useState, useEffect } from 'react'
import { auth } from '../firebase'
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  signOut,
} from 'firebase/auth'

interface AuthValue {
  user: User | undefined | null
  signUp: (email: string, password: string) => Promise<UserCredential>
  logIn: (email: string, password: string) => Promise<UserCredential>
  logOut: () => Promise<void>
}

const AuthContext = React.createContext({} as AuthValue)

export const useAuth = () => {
  return useContext(AuthContext)
}

type AuthContextProviderProps = {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthContextProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>()
  const [loading, setLoading] = useState(true)

  const signUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const logIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logOut = () => {
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AuthValue = {
    user: currentUser,
    signUp: signUp,
    logIn: logIn,
    logOut: logOut,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
