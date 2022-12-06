import React, { useRef, useState } from 'react'
import { Container, Card, Badge, Form, Button, Alert } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { AuthProvider } from '../../contexts/AuthContext'
import { UserCredential } from 'firebase/auth'
import { BrowserRouter, Switch, Route, Link, useHistory } from 'react-router-dom'
import { IUser } from '../../types'
import { FrontendUserGateway } from '../../users'
import { create } from 'domain'

export const SignUpView = React.memo(() => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const passwordConfirmRef = useRef<HTMLInputElement>(null)

  const { signUp, user } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== passwordConfirm) {
      setError('Please enter same password!')
      return
    }

    if (password.length < 6) {
      setError('Password should be at least 6 digits!')
      return
    }

    try {
      setError('')
      setLoading(true)
      const res = await signUp(email, password)

      /** store the user in mangoDB */
      let user: IUser
      user = {
        userId: res.user.uid,
        mail: res.user.email as string,
        avatar:
          'https://www.google.com/imgres?imgurl=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F104827%2Fcat-pet-animal-domestic-104827.jpeg',
        userName: 'Fantasy citizen',
      }
      const createResp = await FrontendUserGateway.createUser(user)
      if (!createResp.success) {
        setError(createResp.message)
      }
    } catch (e) {
      let message
      if (e instanceof Error) {
        message = e.message
      } else {
        message = String(e)
      }
      setError(message)
    }

    setLoading(false)
  }

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
  }

  const handlePasswordConfirmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirm(event.target.value)
  }

  return (
    <>
      <Container
        className="d-flex align-items-center justify-content-center "
        style={{ minHeight: '100vh', maxWidth: '100vw' }}
      >
        <div className="w-100" style={{ maxWidth: '600px' }}>
          <Card>
            <Card.Body>
              <h1 className="text-center mb-4">Sign Up </h1>
              <p className="text-center">
                Start saving{' '}
                <Badge style={{ fontSize: '16px' }} bg="success">
                  Colorful Memories
                </Badge>{' '}
                with your friends in{' '}
                <Badge style={{ fontSize: '16px' }} bg="info">
                  Fantasy City
                </Badge>{' '}
                !{' '}
              </p>
              {error && <Alert variant="danger">{error}</Alert>}
              {user?.email}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" id="email">
                  <Form.Label>
                    <b>Email</b>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    ref={emailRef}
                    onChange={handleEmailChange}
                    required
                  ></Form.Control>
                  <Form.Text className="text-muted">
                    We'll never share your email with anyone else.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" id="password">
                  <Form.Label>
                    <b>Password</b>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    ref={passwordRef}
                    onChange={handlePasswordChange}
                    required
                  ></Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" id="password-confirm">
                  <Form.Label>
                    <b>Password Comfirmation</b>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordConfirm}
                    ref={passwordConfirmRef}
                    onChange={handlePasswordConfirmChange}
                    required
                  ></Form.Control>
                </Form.Group>
                <Button className="w-100" type="submit">
                  Sign Up!
                </Button>
              </Form>
            </Card.Body>
          </Card>
          <div className="w-100 text-center mt-2">
            Already have an account ? <Link to={'/login'}>Log In !</Link>
          </div>
        </div>
      </Container>
    </>
  )
})
