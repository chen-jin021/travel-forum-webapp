import { ChakraProvider, Input } from '@chakra-ui/react'
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  refreshState,
  selectedNodeState,
  selectedAnchorsState,
  selectedExtentState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
  currentNodeState,
  panoramaState,
} from '../../global/Atoms'
import { useAuth } from '../../contexts/AuthContext'
import { useLocation } from 'react-router-dom'
import { FrontendNodeGateway } from '../../nodes'
import { FrontendUserGateway } from '../../users'
import { ILocNode, INode, NodeIdsToNodesMap, RecursiveNodeTree, IUser } from '../../types'
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
  Autocomplete,
} from '@react-google-maps/api'
import { Alert } from '../Alert'
import { ContextMenu } from '../ContextMenu/ContextMenu'
import { Header } from '../Header'
import { LoadingScreen } from '../LoadingScreen'
import {
  CompleteLinkModal,
  CreateNodeModal,
  MoveNodeModal,
  CreateLocationModal,
  CreateInvitationModal,
} from '../Modals'
import { NodeView } from '../NodeView'
import { TreeView } from '../TreeView'
import { MapView } from '../MapView'
import './MainView.scss'
import { createNodeIdsToNodesMap, emptyNode, makeRootWrapper } from './mainViewUtils'
import { FaSleigh } from 'react-icons/fa'
import { containerStyle, center, options, zoom } from './MapSettings'
import { useHistory } from 'react-router-dom'
import { rootCertificates } from 'tls'
import { ShareModal } from '../Modals/ShareModal'

export interface IMainViewProps {
  isLoaded: boolean
}

export const MainView = React.memo(function MainView(props: IMainViewProps) {
  const { isLoaded } = props
  const [isAppLoaded, setIsAppLoaded] = useState(false)
  // modal states
  const [createNodeModalOpen, setCreateNodeModalOpen] = useState(false)
  const [completeLinkModalOpen, setCompleteLinkModalOpen] = useState(false)
  const [moveNodeModalOpen, setMoveNodeModalOpen] = useState(false)
  const [createLocationModalOpen, setCreateLocationModalOpen] = useState(false)
  const [collaborationModalOpen, setCollaborationModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  // node states
  const [selectedNode, setSelectedNode] = useRecoilState(selectedNodeState)
  const [panorama, setPanorama] = useRecoilState(panoramaState)
  const [rootNodes, setRootNodes] = useState<RecursiveNodeTree[]>([
    new RecursiveNodeTree(emptyNode),
  ])
  const refresh = useRecoilValue(refreshState)
  const currentNode = useRecoilValue(currentNodeState)
  // anchor states
  const setSelectedAnchors = useSetRecoilState(selectedAnchorsState)
  const setSelectedExtent = useSetRecoilState(selectedExtentState)
  // alerts
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)
  const [map, setMap] = useState<google.maps.Map>()
  const history = useHistory()
  const { user } = useAuth()
  const [avatar, setAvatar] = useState('')

  /** update our frontend root nodes from the database */
  const loadRootsFromDB = useCallback(
    async (userId: string) => {
      const rootsFromDB = await FrontendNodeGateway.fetchNodeByUserId(userId)
      if (rootsFromDB.success) {
        rootsFromDB.payload && setRootNodes(rootsFromDB.payload)
        setIsAppLoaded(true)
        console.log(rootsFromDB.payload)
        if (map && rootsFromDB.payload) {
          updateAllMarkers(rootsFromDB.payload)
        }
      }
    },
    [refresh, user]
  )

  const getUserFromDB = async (uId: string) => {
    const userResp = await FrontendUserGateway.getUser(uId)
    if (!userResp.success || !userResp.payload) {
      return
    }
    const user: IUser = userResp.payload
    setAvatar(user.avatar)
  }

  useEffect(() => {
    if (user) {
      getUserFromDB(user.uid)
    }
  }, [refresh])

  const updateAllMarkers = (rootNodes: RecursiveNodeTree[]) => {
    if (rootNodes.length === 0) {
      if (map) {
        map.setCenter(center)
        map.setZoom(zoom)
      }
      return
    }
    const markers: google.maps.Marker[] = rootNodes.map((tree) => {
      const node = tree.node as ILocNode
      return new google.maps.Marker({
        map: map,
        position: { lat: node.lat, lng: node.lng },
      })
    })
    const bounds = new google.maps.LatLngBounds()
    for (let i = 0; i < markers.length; i++) {
      const pos = markers[i].getPosition()
      if (pos) {
        bounds.extend(pos)
      }
      if (map) {
        setInfoWindow(markers[i], i, map, rootNodes)
      }
    }
    if (map) {
      map.setCenter(bounds.getCenter())
    }
    if (map) {
      map.fitBounds(bounds)
    }
  }

  const onLoad = (map: google.maps.Map) => {
    setMap(map)
    /** if there are no marks, don't need to set marks */
    if (rootNodes.length === 0) {
      map.setCenter(center)
      map.setZoom(zoom)
      return
    }
    const markers: google.maps.Marker[] = rootNodes.map((tree) => {
      const node = tree.node as ILocNode
      return new google.maps.Marker({
        map: map,
        position: { lat: node.lat, lng: node.lng },
      })
    })
    const bounds = new google.maps.LatLngBounds()
    for (let i = 0; i < markers.length; i++) {
      const pos = markers[i].getPosition()
      if (pos) {
        bounds.extend(pos)
      }
      setInfoWindow(markers[i], i, map, rootNodes)
    }
    map.setCenter(bounds.getCenter())
    map.fitBounds(bounds)
  }

  const setInfoWindow = (
    marker: google.maps.Marker,
    no: number,
    map: google.maps.Map,
    rootNodes: RecursiveNodeTree[]
  ) => {
    const content =
      '<div id="content">' +
      '<div id="siteNotice">' +
      '</div>' +
      `<h1 id="firstHeading" class="firstHeading">${rootNodes[no].node.title}</h1>` +
      `<div id="bodyContent">${rootNodes[no].node.content}</div>` +
      '</div>'
    const infoWindow = new google.maps.InfoWindow({
      content: content,
      ariaLabel: rootNodes[no].node.title,
    })
    marker.addListener('click', () => {
      map.setCenter(marker.getPosition() as google.maps.LatLng)
      infoWindow.open({
        anchor: marker,
        map,
      })
    })
    marker.addListener('rightclick', () => {
      history.push(`/main/${rootNodes[no].node.nodeId}/`)
      setSelectedNode(rootNodes[no].node)
    })
  }

  useEffect(() => {
    if (!user) {
      setRootNodes([])
      return
    }
    loadRootsFromDB(user.uid)
  }, [loadRootsFromDB, refresh])

  const rootRecursiveNodeTree: RecursiveNodeTree = useMemo(
    () => makeRootWrapper(rootNodes),
    [rootNodes]
  )

  // map each nodeId to its full node object for easy access
  const nodeIdsToNodesMap: NodeIdsToNodesMap = useMemo(
    () => createNodeIdsToNodesMap(rootNodes),
    [rootNodes]
  )

  // node routing	logic
  const url = useLocation().pathname.slice(0, -1)
  const lastUrlParam = url.substring(url.lastIndexOf('/') + 1)

  useEffect(() => {
    const currentNodeId = lastUrlParam
    async function fetchNodeFromUrl() {
      const fetchResp = await FrontendNodeGateway.getNode(currentNodeId)
      if (fetchResp.success) {
        setSelectedNode(fetchResp.payload)
      }
    }
    fetchNodeFromUrl()
  }, [lastUrlParam])

  const globalKeyHandlers = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        setSelectedAnchors([])
        setSelectedExtent(null)
    }
  }

  // Trigger on app load
  useEffect(() => {
    document.addEventListener('keydown', globalKeyHandlers)
  }, [])

  // button handlers
  const handleCreateNodeButtonClick = useCallback(() => {
    setCreateNodeModalOpen(true)
  }, [setCreateNodeModalOpen])

  const handleDeleteNodeButtonClick = useCallback(
    async (node: INode) => {
      if (node) {
        const deleteResp = await FrontendNodeGateway.deleteNode(node.nodeId)
        if (!deleteResp.success) {
          setAlertIsOpen(true)
          setAlertTitle('Delete node failed')
          setAlertMessage('Delete node failed in MainView.tsx:97')
          return
        }
        const path: string[] = node.filePath.path
        if (path.length > 1) {
          const parentId: string = path[path.length - 2]
          const parentResp = await FrontendNodeGateway.getNode(parentId)
          if (parentResp.success) {
            setSelectedNode(parentResp.payload)
            return
          }
        }
        setSelectedNode(null)
        if (user) {
          loadRootsFromDB(user.uid)
        }
      }
    },
    [loadRootsFromDB]
  )

  const handleMoveNodeButtonClick = useCallback(() => {
    setMoveNodeModalOpen(true)
  }, [])

  const handleCompleteLinkClick = useCallback(() => {
    setCompleteLinkModalOpen(true)
  }, [])

  const handleHomeClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const handleCreateLocationClick = useCallback(() => {
    setCreateLocationModalOpen(true)
  }, [])

  const handlePanoramaClick = useCallback(() => {
    setPanorama(!panorama)
  }, [panorama])

  const handleCollaborationClick = useCallback(() => {
    setCollaborationModalOpen(true)
  }, [])

  const handleShareClick = useCallback(() => {
    setShareModalOpen(true)
  }, [])

  const getSelectedNodeChildren = useCallback(() => {
    if (!selectedNode) return undefined
    return selectedNode.filePath.children.map(
      (childNodeId) => nodeIdsToNodesMap[childNodeId]
    )
  }, [nodeIdsToNodesMap, selectedNode])

  let xLast: number
  let dragging: boolean = false

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = true
    xLast = e.screenX
    document.removeEventListener('pointermove', onPointerMove)
    document.addEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.addEventListener('pointerup', onPointerUp)
  }

  const onPointerMove = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (treeView.current && dragging) {
      const treeViewElement = treeView.current
      let width = parseFloat(treeViewElement.style.width)
      const deltaX = e.screenX - xLast // The change in the x location
      const newWidth = (width += deltaX)
      if (!(newWidth < 100 || newWidth > 480)) {
        treeViewElement.style.width = String(width) + 'px'
        xLast = e.screenX
      }
    }
  }

  const onPointerUp = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = false
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
  }

  const treeView = useRef<HTMLHeadingElement>(null)

  return (
    <ChakraProvider>
      {!isAppLoaded ? (
        <LoadingScreen hasTimeout={true} />
      ) : (
        <div className="main-container">
          <Alert></Alert>
          <Header
            onHomeClick={handleHomeClick}
            onCreateNodeButtonClick={handleCreateLocationClick}
            nodeIdsToNodesMap={nodeIdsToNodesMap}
            onPanoramaClick={handlePanoramaClick}
            avatarUrl={avatar}
          />
          <CreateLocationModal
            isOpen={createLocationModalOpen}
            onClose={() => setCreateLocationModalOpen(false)}
            roots={rootNodes}
            nodeIdsToNodesMap={nodeIdsToNodesMap}
            onSubmit={() => {
              if (user) {
                loadRootsFromDB(user.uid)
              }
            }}
            curMap={map as google.maps.Map}
          />
          <CreateNodeModal
            isOpen={createNodeModalOpen}
            onClose={() => setCreateNodeModalOpen(false)}
            roots={rootNodes}
            nodeIdsToNodesMap={nodeIdsToNodesMap}
            onSubmit={() => {
              if (user) loadRootsFromDB(user?.uid)
            }}
          />
          <CreateInvitationModal
            isOpen={collaborationModalOpen}
            onClose={() => setCollaborationModalOpen(false)}
            onSubmit={() => {}}
            nodeIdsToNodes={nodeIdsToNodesMap}
          />
          <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} />

          {selectedNode && (
            <MoveNodeModal
              isOpen={moveNodeModalOpen}
              onClose={() => setMoveNodeModalOpen(false)}
              onSubmit={() => {}}
              node={selectedNode}
              roots={rootNodes}
            />
          )}
          <div className="content">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                options={options as google.maps.MapOptions}
                onLoad={onLoad}
                center={center}
                zoom={11}
              />
            ) : (
              <div>Map Loading...</div>
            )}
            {!panorama && (
              <div className="treeView-container" ref={treeView}>
                <TreeView
                  roots={rootNodes}
                  parentNode={selectedNode}
                  setParentNode={setSelectedNode}
                />
              </div>
            )}
            {selectedNode && !panorama && (
              <div className="node-wrapper">
                <NodeView
                  childNodes={
                    selectedNode
                      ? getSelectedNodeChildren()
                      : rootNodes.map((root) => root.node)
                  }
                  currentNode={selectedNode ? selectedNode : rootRecursiveNodeTree.node}
                  onDeleteButtonClick={handleDeleteNodeButtonClick}
                  onMoveButtonClick={handleMoveNodeButtonClick}
                  onCompleteLinkClick={handleCompleteLinkClick}
                  onCreateNodeButtonClick={handleCreateNodeButtonClick}
                  onCollaborationButtonClick={handleCollaborationClick}
                  onShareBtnClick={handleShareClick}
                  nodeIdsToNodesMap={nodeIdsToNodesMap}
                  inSquare={false}
                />
              </div>
            )}
          </div>
        </div>
      )}
      <ContextMenu />
    </ChakraProvider>
  )
})
