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
} from '@chakra-ui/react'
import { mapState } from '../../../global/Atoms'
import React, { useEffect, useRef, useState } from 'react'
import {
  INode,
  NodeIdsToNodesMap,
  NodeType,
  nodeTypes,
  makeINodePath,
  RecursiveNodeTree,
} from '../../../types'
import { Button } from '../../Button'
import { TreeView } from '../../TreeView'
import './CreateLocationModal.scss'
import { createNodeFromModal, uploadImage } from './createNodeUtils'
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
  Autocomplete,
} from '@react-google-maps/api'
import { useSetRecoilState, useRecoilState } from 'recoil'
import { selectedNodeState, refreshState } from '../../../global/Atoms'
import { FrontendNodeGateway } from '../../../nodes'
import { generateObjectId } from '../../../global'
import { useAuth } from '../../../contexts/AuthContext'

export interface ICreateLocationModalProps {
  isOpen: boolean
  nodeIdsToNodesMap: NodeIdsToNodesMap
  onClose: () => void
  onSubmit: () => unknown
  roots: RecursiveNodeTree[]
  curMap: google.maps.Map
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const CreateLocationModal = (props: ICreateLocationModalProps) => {
  // deconstruct props variables

  const { isOpen, onClose, roots, nodeIdsToNodesMap, onSubmit, curMap } = props
  // state variables
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const [selectedParentNode, setSelectedParentNode] = useState<INode | null>(null)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState<NodeType>('' as NodeType)
  const [error, setError] = useState<string>('')
  const [map, setMap] = useRecoilState(mapState)
  const [refresh, setRefresh] = useRecoilState(refreshState)

  const { user } = useAuth()
  // event handlers for the modal inputs and dropdown selects
  const handleSelectedTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(event.target.value.toLowerCase() as NodeType)
    setContent('')
  }

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value)
  }

  const handleTextContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
  }

  const handleImageContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value)
  }

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const retrieveGeocode = async (addr: string) => {
    const coder = new google.maps.Geocoder()
    const req: google.maps.GeocoderRequest = {
      address: addr,
    }
    let result: google.maps.GeocoderResult[] = []
    await coder.geocode(req, (res, status) => {
      if (status === 'ZERO_RESULTS') {
        setError('Please enter a valid location')
        return
      } else {
        if (res) {
          result = res
        }
      }
    })
    return result
  }

  // called when the "Create" button is clicked
  const handleSubmit = async () => {
    if (!title) {
      setError('Please set a location!')
      return
    }
    if (!location) {
      setError('Please set a location!')
      return
    }
    if (!user) {
      setError("You haven't logged in yet...")
      return
    }
    const r = await retrieveGeocode(location)
    /** If the location is not valid */
    if (r.length === 0) {
      return
    }
    const target = r[0]
    const RespGetNodeByLatLing = await FrontendNodeGateway.findNodeByLatLngAndId(
      target.geometry.location.lat(),
      target.geometry.location.lng(),
      user.uid
    )
    if (RespGetNodeByLatLing.success && RespGetNodeByLatLing.payload) {
      setError('This Location is already in your collection!')
      return
    }
    const nodeId: string = generateObjectId('loc')

    const newNode = {
      nodeId: nodeId,
      type: 'loc' as NodeType,
      title: title,
      content: location,
      filePath: makeINodePath([nodeId]),
      dateCreated: new Date(),
      userReadIds: [],
      userWriteIds: [],
      ownerId: user.uid,
      lat: target.geometry.location.lat(),
      lng: target.geometry.location.lng(),
      public: false
    }
    const nodeResponse = await FrontendNodeGateway.createNode(newNode)
    if (!nodeResponse.success) {
      setError('Sorry! Unable to access backend.')
      return
    }
    const marker = new google.maps.Marker({
      position: target.geometry.location,
    })
    marker.setMap(curMap)
    onSubmit()
    handleClose()
    setRefresh(!refresh)
  }

  /** Reset all our state variables and close the modal */
  const handleClose = () => {
    onClose()
    setTitle('')
    setSelectedParentNode(null)
    setSelectedType('' as NodeType)
    setContent('')
    setError('')
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    const link = files && files[0] && (await uploadImage(files[0]))
    link && setContent(link)
  }

  // content prompts for the different node types
  let contentInputPlaceholder: string
  switch (selectedType) {
    case 'text':
      contentInputPlaceholder = 'Text content...'
      break
    case 'image':
      contentInputPlaceholder = 'Image URL...'
      break
    default:
      contentInputPlaceholder = 'Content...'
  }

  const isImage: boolean = selectedType === 'image'
  const isText: boolean = selectedType === 'text'
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a new location!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div style={{ marginBottom: '20px' }}>
              <Input value={title} onChange={handleTitleChange} placeholder="Title..." />
            </div>
            <Autocomplete
              className="autocomplete"
              onPlaceChanged={() => {
                if (inputRef.current) {
                  setLocation(inputRef.current.value)
                }
              }}
            >
              <Input
                ref={inputRef}
                value={location}
                onChange={handleLocationChange}
                placeholder="Search your location"
              />
            </Autocomplete>
          </ModalBody>
          <ModalFooter>
            {error.length > 0 && <div className="modal-error">{error}</div>}
            <div className="modal-footer-buttons">
              <Button text="Create" onClick={handleSubmit} />
            </div>
          </ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  )
}
