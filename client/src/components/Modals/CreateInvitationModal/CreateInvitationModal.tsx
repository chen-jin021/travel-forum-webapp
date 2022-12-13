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

export interface ICreateInvitationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => unknown
  nodeIdsToNodes: NodeIdsToNodesMap
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const CreateInvitationModal = (props: ICreateInvitationModalProps) => {
  // deconstruct props variables

  const { isOpen, onClose, onSubmit, nodeIdsToNodes } = props
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

  const { user } = useAuth()

  const handleClose = () => {
    onClose()
    setMail('')
    setError('')
  }

  const handleSubmit = async () => {
    setError('')
    if (!user) {
      setError('You have not logged yet!')
      return
    }
    const reg = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/
    if (!reg.test(mail)) {
      setError('Please enter a valid email')
      return
    }
    if (user.email === mail) {
      setError('You can not invite yourself to collaborate!')
      return
    }
    const selfResp = await FrontendUserGateway.getUser(user.uid)
    if (!selfResp.success || !selfResp.payload) {
      setError(selfResp.message)
      return
    }
    const selfUser = selfResp.payload
    const userResp = await FrontendUserGateway.getUserByMail(mail)
    if (!userResp.success || !userResp.payload) {
      setError(userResp.message)
      return
    }
    const rcverUser = userResp.payload
    const ivtOBj: IInvitation = {
      inviteId: generateObjectId('ivt'),
      rcverId: rcverUser.userId,
      rcverMail: rcverUser.mail,
      rcverName: rcverUser.userName,
      rcverUrl: rcverUser.avatar,
      senderId: selfUser.userId,
      senderMail: selfUser.mail,
      senderName: selfUser.userName,
      senderUrl: selfUser.avatar,
      createdDate: new Date(),
      type: permission,
      nodeId: currentNode.nodeId,
    }
    const ivtResp = await FrontendInvitationGateway.createIvt(ivtOBj)
    if (!ivtResp.success || !ivtResp.payload) {
      setError(ivtResp.message)
      return
    }
    handleClose()
  }

  const handleMailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMail(event.target.value)
  }

  return (
    <Modal size={'2xl'} isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send an invitation!</ModalHeader>
          <ModalCloseButton />
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl isRequired>
                <FormLabel htmlFor="email">Your Friend&apos;s email</FormLabel>
                <Input id="email" type="email" value={mail} onChange={handleMailChange} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel style={{ marginTop: '20px' }} as="legend">
                  Permission
                </FormLabel>
                <RadioGroup value={permission} onChange={setPermission}>
                  <HStack spacing="24px">
                    <Radio value={'read'}>Read Only</Radio>
                    <Radio value={'write'}>Read & Write</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              {error.length > 0 && <div className="modal-error">{error}</div>}
              <div className="modal-footer-buttons">
                <Button onClick={handleSubmit}> Send invitation</Button>
              </div>
            </ModalFooter>
          </Form>
        </ModalContent>
      </div>
    </Modal>
  )
}
