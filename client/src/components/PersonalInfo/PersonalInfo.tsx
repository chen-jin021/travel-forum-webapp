import React, { useCallback, useEffect, useState, useRef } from 'react'
import { PersonalHeader } from '../PersonalHeader'
import {
  ChakraProvider,
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  Button,
  IconButton,
  Icon,
} from '@chakra-ui/react'
import { useRecoilState } from 'recoil'
import { Container, Alert } from 'react-bootstrap'
import { selectedNodeState } from '../../global/Atoms'
import { useAuth } from '../../contexts/AuthContext'
import { FrontendUserGateway } from '../../users'
import { IUser } from '../../types'
import { MdMail } from 'react-icons/md'
import * as ai from 'react-icons/ai'
import './PersonalInfo.scss'
import { Link } from 'react-router-dom'
import { EditableText } from '../EditableText'
import { IUserProperty, makeIUserProperty } from '../../types/IUserProperty'
import { upload } from './PersonalInfoUtils'
import { SendingInvitationModal } from '../Modals'

export const PersonalInfo = () => {
  const [selectedNode, setSelectedNode] = useRecoilState(selectedNodeState)
  const [nickName, setNickName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [mail, setMail] = useState('')
  const [editing, setEditing] = useState<boolean>(false)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [sendingIvtOpen, setSendingIvtOpen] = useState(false)
  const [myIvtOpen, setMyIvtOpen] = useState(false)
  const [from, setFrom] = useState(false)

  const { user } = useAuth()

  const getUserFromDB = async (uId: string) => {
    const userResp = await FrontendUserGateway.getUser(uId)
    if (!userResp.success || !userResp.payload) {
      return
    }
    const user: IUser = userResp.payload
    setNickName(user.userName)
    setMail(user.mail)
    setAvatarUrl(user.avatar)
  }

  useEffect(() => {
    if (user) {
      getUserFromDB(user.uid)
    }
  }, [refresh])

  const handleHomeClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  /* Method to update the node title */
  const handleUpdateName = async (name: string) => {
    if (!user) {
      setError('You seem not to be logged in yet')
      return
    }
    setNickName(name)
    const userProperty: IUserProperty = makeIUserProperty('userName', name)
    const nameUpdateResp = await FrontendUserGateway.updateUser(user.uid, [userProperty])
    console.log(nameUpdateResp)
    if (!nameUpdateResp.success) {
      setError(nameUpdateResp.message)
    }
    setRefresh(!refresh)
  }

  const handleDblAvatar = (e: React.MouseEvent) => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      setError('You seem not to be logged in yet')
      return
    }
    const files = event.target.files
    const url = files && files[0] && (await upload(files[0]))
    if (!url) {
      setError('Unable to access backend!')
      return
    }
    const userProperty: IUserProperty = makeIUserProperty('avatar', url)
    const updateResp = await FrontendUserGateway.updateUser(user.uid, [userProperty])
    if (!updateResp.success) {
      setError(updateResp.message)
    }
    setRefresh(!refresh)
  }

  const handleSendIvtClose = () => {
    setSendingIvtOpen(false)
  }

  const handleMyIvtClose = () => {
    setMyIvtOpen(false)
  }

  if (!user) {
    return
  }

  return (
    <>
      <ChakraProvider>
        <div className="main-container">
          <PersonalHeader onHomeClick={handleHomeClick}></PersonalHeader>
          <div className="content">
            <SendingInvitationModal
              isOpen={sendingIvtOpen}
              onClose={handleSendIvtClose}
              uid={user?.uid}
              from={false}
            ></SendingInvitationModal>
            <SendingInvitationModal
              isOpen={myIvtOpen}
              onClose={handleMyIvtClose}
              uid={user?.uid}
              from={true}
            ></SendingInvitationModal>
            <Container
              className="d-flex align-items-center justify-content-center "
              style={{ maxHeight: '90vh', maxWidth: '100vw' }}
            >
              <div style={{ maxWidth: '600px' }}>
                <div className="text-center avatar-wrapper">
                  <div style={{ width: '400px' }}>
                    {error && <Alert variant="danger">{error}</Alert>}
                  </div>
                  <input
                    ref={inputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    type="file"
                  ></input>
                  <div onDoubleClick={handleDblAvatar}>
                    <Avatar size="2xl" name={nickName} src={avatarUrl} />
                  </div>

                  <div
                    className="nick-name"
                    onDoubleClick={(e) => {
                      setEditing(true)
                    }}
                  >
                    <EditableText
                      isPersonal={true}
                      text={nickName}
                      editing={editing}
                      setEditing={setEditing}
                      onEdit={handleUpdateName}
                    />
                  </div>
                  <div className="mail">
                    <MdMail style={{ display: 'inline' }} />
                    {'  '}
                    <div style={{ display: 'inline' }}>{mail}</div>{' '}
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <Button
                      style={{ width: '240px' }}
                      leftIcon={<Icon as={ai.AiOutlineArrowUp} />}
                      colorScheme={'teal'}
                      onClick={(e) => {
                        setSendingIvtOpen(true)
                      }}
                    >
                      Invitations to others
                    </Button>
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <Button
                      style={{ width: '240px' }}
                      leftIcon={<Icon as={ai.AiOutlineArrowDown} />}
                      aria-label="Your Invitation"
                      colorScheme={'blue'}
                      onClick={(e) => {
                        setMyIvtOpen(true)
                      }}
                    >
                      Invitations to me
                    </Button>
                  </div>
                </div>
              </div>
            </Container>
          </div>
        </div>
      </ChakraProvider>
    </>
  )
}
