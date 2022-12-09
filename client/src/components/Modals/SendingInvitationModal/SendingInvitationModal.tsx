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
import './SendingInvitationModal.scss'
import { InvitationItem } from './InvitationItem'

export interface ISendingInvitationModalProps {
  isOpen: boolean
  onClose: () => void
  uid: string
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const SendingInvitationModal = (props: ISendingInvitationModalProps) => {
  // deconstruct props variables

  const { isOpen, onClose, uid } = props
  // state variables
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const [selectedParentNode, setSelectedParentNode] = useState<INode | null>(null)
  const [location, setLocation] = useState('')
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState<NodeType>('' as NodeType)
  const [error, setError] = useState<string>('')
  const [map, setMap] = useRecoilState(mapState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const [mail, setMail] = useState('')
  const [permission, setPermission] = useState('read')
  const currentNode = useRecoilValue(currentNodeState)
  const [ivts, setIvts] = useState<IInvitation[]>([])

  const { user } = useAuth()

  const handleClose = () => {
    onClose()
    setContent('')
    setError('')
  }

  const getIvts = async (uid: string) => {
    const IvtResp = await FrontendInvitationGateway.getSentIvt(uid)
    if (!IvtResp.success || !IvtResp.payload) {
      setError(IvtResp.message)
      return
    }
    setIvts(IvtResp.payload)
  }

  useEffect(() => {
    if (isOpen) {
      getIvts(uid)
    }
  }, [isOpen])

  return (
    <Modal size={'2xl'} isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sent Invitations</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="list-wrapper">
              {ivts.map((ivt: IInvitation) => {
                return <InvitationItem ivt={ivt} key={ivt.inviteId}></InvitationItem>
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
