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
  setScript,
  Avatar,
} from '@chakra-ui/react'
import { mapState } from '../../../global/Atoms'
import { Form } from 'react-bootstrap'
import React, { useEffect, useRef, useState } from 'react'
import {
  INode,
  NodeIdsToNodesMap,
  NodeType,
  nodeTypes,
  makeINodePath,
  RecursiveNodeTree,
  IUser,
  IMessage,
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
import { FrontendMessageGateway } from '../../../messages'

export interface ICreateCommentModalProps {
  isOpen: boolean
  onClose: () => void
  nodeIdsToNodes: NodeIdsToNodesMap
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const CreateCommentModal = (props: ICreateCommentModalProps) => {
  // deconstruct props variables

  const { isOpen, onClose, nodeIdsToNodes } = props
  // state variables
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const [selectedParentNode, setSelectedParentNode] = useState<INode | null>(null)
  const [location, setLocation] = useState('')
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState<NodeType>('' as NodeType)
  const [error, setError] = useState<string>('')
  const [map, setMap] = useRecoilState(mapState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const [comment, setComment] = useState('')
  const [permission, setPermission] = useState('read')
  const currentNode = useRecoilValue(currentNodeState)
  const [curUser, setCurUser] = useState<IUser>()

  const { user } = useAuth()
  if (!user) {
    return <></>
  }

  const loadUserFromDB = async (uid: string) => {
    const userResp = await FrontendUserGateway.getUser(uid)
    if (!userResp.success || !userResp.payload) {
      setError('Unable to access backend')
      return
    }
    setCurUser(userResp.payload)
  }

  useEffect(() => {
    if (isOpen) {
      loadUserFromDB(user.uid)
    }
  }, [isOpen])

  const handleClose = () => {
    onClose()
    setContent('')
    setError('')
  }

  const handleSubmit = async () => {
    setError('')
    if (!comment) {
      setError('Cannot leave empty comment!')
      return
    }

    const message: IMessage = {
      messageId: generateObjectId('mes'),
      userId: user.uid,
      information: comment,
      dateCreated: new Date(),
      nodeId: currentNode.nodeId,
    }

    const commentResp = await FrontendMessageGateway.createMessage(message)
    if (!commentResp.success || !commentResp.payload) {
      setError(commentResp.message)
      return
    }
    handleClose()
  }

  const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value)
  }

  return (
    <Modal size={'xl'} isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Leave a comment to this Node!</ModalHeader>
          <ModalCloseButton />
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <div className="text-center">
                <div style={{ marginTop: '20px' }}>
                  <Avatar src={curUser?.avatar} />
                </div>
                <div
                  style={{ marginTop: '20px', fontFamily: 'Avenir', fontSize: '25px' }}
                >
                  {curUser?.userName}
                </div>
              </div>
              <FormControl isRequired>
                <FormLabel htmlFor="email">Your Comment</FormLabel>
                <Textarea value={comment} onChange={handleCommentChange} />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              {error.length > 0 && <div className="modal-error">{error}</div>}
              <div className="modal-footer-buttons">
                <Button onClick={handleSubmit}> Leave Comment</Button>
              </div>
            </ModalFooter>
          </Form>
        </ModalContent>
      </div>
    </Modal>
  )
}
