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
import { IServiceResponse } from '../../../types'
import { DEFAULT_BREAKPOINTS } from 'react-bootstrap/esm/ThemeProvider'

export interface ISendingInvitationModalProps {
  isOpen: boolean
  onClose: () => void
  uid: string
  from: boolean
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const SendingInvitationModal = (props: ISendingInvitationModalProps) => {
  // deconstruct props variables

  const { isOpen, onClose, uid, from } = props
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
  const [ivts, setIvts] = useState<IInvitation[]>([])
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
    console.log(acceptResp)
    setRefresh(!refresh)
  }

  const getIvts = async (uid: string) => {
    let IvtResp: IServiceResponse<IInvitation[]>
    if (!from) {
      IvtResp = await FrontendInvitationGateway.getSentIvt(uid)
    } else {
      IvtResp = await FrontendInvitationGateway.getRcvIvt(uid)
    }
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
  }, [isOpen, refresh])

  return (
    <Modal size={'3xl'} isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {from ? 'Invitation I recieved' : 'Invitation I sent'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="list-wrapper">
              {ivts.map((ivt: IInvitation) => {
                return (
                  <InvitationItem
                    ivt={ivt}
                    key={ivt.inviteId}
                    from={from}
                    handleDelete={handleDelete}
                    handleAccept={handleAccept}
                  ></InvitationItem>
                )
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
