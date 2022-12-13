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
import './CommentModal.scss'
import { CommentItem } from './CommentItem'
import { IServiceResponse } from '../../../types'
import { DEFAULT_BREAKPOINTS } from 'react-bootstrap/esm/ThemeProvider'
import { FrontendMessageGateway } from '../../../messages'

export interface ICommentModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const CommentModal = (props: ICommentModalProps) => {
  // deconstruct props variables

  const { isOpen, onClose } = props
  // state variables
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const [selectedParentNode, setSelectedParentNode] = useState<INode | null>(null)
  const [location, setLocation] = useState('')
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState<NodeType>('' as NodeType)
  const [error, setError] = useState<string>('')
  const [map, setMap] = useRecoilState(mapState)
  const [mail, setMail] = useState('')
  const [permission, setPermission] = useState('read')
  const currentNode = useRecoilValue(currentNodeState)
  const [msg, setMsgs] = useState<IMessage[]>([])
  const [refresh, setRefresh] = useState(false)

  const { user } = useAuth()

  const handleClose = () => {
    onClose()
    setContent('')
    setError('')
  }

  const handleDelete = async (ivtId: string) => {
    const delResp = await FrontendInvitationGateway.declineIvt(ivtId)
    if (!delResp.success || !delResp.payload) {
      setError(delResp.message)
      return
    }
    setRefresh(!refresh)
  }

  const handleAccept = async (ivtId: string) => {
    const acceptResp = await FrontendInvitationGateway.acceptIvt(ivtId)
    if (!acceptResp.success || !acceptResp.payload) {
      setError(acceptResp.message)
      return
    }
    setRefresh(!refresh)
  }

  const getComments = async (nodeId: string) => {
    const commentsResp = await FrontendMessageGateway.getMessagesByNodeId(nodeId)
    if (!commentsResp.success || !commentsResp.payload) {
      setError('This node has not had comments yet~')
      return
    }
    setMsgs(commentsResp.payload)
  }

  useEffect(() => {
    if (isOpen) {
      getComments(currentNode.nodeId)
    }
  }, [isOpen, refresh])

  return (
    <Modal size={'3xl'} isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Recieved Comments</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="list-wrapper">
              {msg.map((msg: IMessage) => {
                return <CommentItem msg={msg} key={msg.messageId}></CommentItem>
              })}
            </div>
            <div></div>
          </ModalBody>
          <ModalFooter>
            {error.length > 0 && <div className="modal-error">{error}</div>}
            <div className="modal-footer-buttons"></div>
          </ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  )
}
