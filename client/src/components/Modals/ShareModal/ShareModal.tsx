import {
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
  Portal,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  RadioGroup,
  HStack,
  Radio,
  Button,
  Avatar,
} from '@chakra-ui/react'
import { mapState } from '../../../global/Atoms'
import { Alert, Form } from 'react-bootstrap'
import React, { useEffect, useRef, useState } from 'react'
import {
  INode,
  NodeIdsToNodesMap,
  NodeType,
  nodeTypes,
  makeINodePath,
  RecursiveNodeTree,
  ILocNode,
  makeINodeProperty,
} from '../../../types'
// import { Button } from '../../Button'
import { TreeView } from '../../TreeView'
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
  Autocomplete,
} from '@react-google-maps/api'
import { useRecoilValue } from 'recoil'
import { useSetRecoilState, useRecoilState } from 'recoil'
import { selectedNodeState, refreshState, currentNodeState } from '../../../global/Atoms'
import { FrontendNodeGateway } from '../../../nodes'
import { generateObjectId } from '../../../global'
import { useAuth } from '../../../contexts/AuthContext'
import { IInvitation } from '../../../types/IInvitation'
import { FrontendUserGateway } from '../../../users'
import { FrontendInvitationGateway } from '../../../invitations'
import { Container } from '@chakra-ui/react'
import { CiLocationOn } from 'react-icons/ci'
import './ShareModal.scss'
import { getAdditionalUserInfo } from 'firebase/auth'
import { url } from 'inspector'
import { GoAlert } from 'react-icons/go'

export interface IShareModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const ShareModal = (props: IShareModalProps) => {
  // deconstruct props variables

  const { isOpen, onClose } = props
  // state variables
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const [selectedParentNode, setSelectedParentNode] = useState<INode | null>(null)
  const [location, setLocation] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string>('')
  const [map, setMap] = useRecoilState(mapState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const [mail, setMail] = useState('')
  const [permission, setPermission] = useState('read')
  const currentNode = useRecoilValue(currentNodeState)
  const [avatar, setAvatar] = useState('')
  const [name, setName] = useState('')
  const { user } = useAuth()

  const handleClose = () => {
    onClose()
    setContent('')
    setError('')
  }

  const handlePublic = async () => {
    const pub = makeINodeProperty('public', true)
    const updatePublicResp = await FrontendNodeGateway.updateNode(currentNode.nodeId, [
      pub,
    ])
    if (!updatePublicResp.success || !updatePublicResp.payload) {
      setError(updatePublicResp.message)
      return
    }
    setSelectedNode(updatePublicResp.payload)
    handleClose()
  }

  const getUser = async (userId: string) => {
    const userResp = await FrontendUserGateway.getUser(userId)
    if (!userResp.success || !userResp.payload) {
      setError('failed to fetch this user')
      return
    }
    setName(userResp.payload.userName)
    setAvatar(userResp.payload.avatar)
  }

  useEffect(() => {
    if (isOpen) {
      getUser((currentNode as ILocNode).ownerId)
    }
  }, [isOpen])

  return (
    <Modal size={'xl'} isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share this location!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Container
              className="d-flex align-items-center justify-content-center "
              style={{ maxHeight: '90vh', maxWidth: '100vw' }}
            >
              <div className="text-center">
                <Alert variant="danger">
                  Are you sure to share this location to square?
                  <br />
                  <GoAlert style={{ display: 'inline' }} /> &nbsp; (This operation is
                  irreversible)
                </Alert>
                <div>
                  <CiLocationOn style={{ display: 'inline' }} />
                  &nbsp; <b>Location Name:</b>
                  &nbsp;{currentNode.title}
                </div>
                <div style={{ marginTop: '20px' }}>
                  <Avatar src={avatar} />
                </div>
                <div
                  style={{ marginTop: '20px', fontFamily: 'Avenir', fontSize: '25px' }}
                >
                  {name}
                </div>
              </div>
            </Container>
          </ModalBody>
          <ModalFooter>
            {error.length > 0 && <div className="modal-error">{error}</div>}
            <div className="modal-footer-buttons">
              <div className="modal-footer-buttons">
                <Button onClick={handlePublic}> Public to Square!</Button>
              </div>
            </div>
          </ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  )
}
