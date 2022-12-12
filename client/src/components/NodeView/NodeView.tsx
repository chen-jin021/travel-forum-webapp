import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FrontendAnchorGateway } from '../../anchors'
import { generateObjectId } from '../../global'
import { IAnchor, ILocNode, INode, isSameExtent, NodeIdsToNodesMap } from '../../types'
import { NodeBreadcrumb } from './NodeBreadcrumb'
import { NodeContent } from './NodeContent'
import { NodeHeader } from './NodeHeader'
import { NodeLinkMenu } from './NodeLinkMenu'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  isLinkingState,
  refreshState,
  startAnchorState,
  endAnchorState,
  selectedAnchorsState,
  selectedExtentState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
  currentNodeState,
  refreshLinkListState,
  currentPlayerState,
  controlCurrentPlayerState,
} from '../../global/Atoms'
import './NodeView.scss'
import { FrontendNodeGateway } from '../../nodes'
import { useAuth } from '../../contexts/AuthContext'
import { ReaderHeader } from './ReaderHeader'

export interface INodeViewProps {
  currentNode: INode
  // map of nodeIds to nodes
  nodeIdsToNodesMap: NodeIdsToNodesMap
  // handler for completing link
  onCompleteLinkClick: () => void
  // handler for opening create node modal
  onCreateNodeButtonClick: () => void
  // handler for deleting currentNode
  onDeleteButtonClick: (node: INode) => void
  // handler for opening move node modal
  onMoveButtonClick: (node: INode) => void
  // handler for collaboration
  onCollaborationButtonClick: () => void
  // children used when renderinßg folder node
  onShareBtnClick: () => void
  childNodes?: INode[]
}

/** Full page view focused on a node's content, with annotations and links */
export const NodeView = (props: INodeViewProps) => {
  const {
    currentNode,
    nodeIdsToNodesMap,
    onCompleteLinkClick,
    onCreateNodeButtonClick,
    onDeleteButtonClick,
    onMoveButtonClick,
    onCollaborationButtonClick,
    onShareBtnClick,
    childNodes,
  } = props
  const setIsLinking = useSetRecoilState(isLinkingState)
  const [startAnchor, setStartAnchor] = useRecoilState(startAnchorState)
  const setEndAnchor = useSetRecoilState(endAnchorState)
  const setSelectedAnchors = useSetRecoilState(selectedAnchorsState)
  const selectedExtent = useRecoilValue(selectedExtentState)
  // eslint-disable-next-line
  const refresh = useRecoilValue(refreshState)
  const refreshLinkList = useRecoilValue(refreshLinkListState)
  const [anchors, setAnchors] = useState<IAnchor[]>([])
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)

  const [, setPlaying] = useRecoilState(controlCurrentPlayerState)
  const [permission, setPermission] = useState('owner')

  // eslint-disable-next-line
  const [currNode, setCurrentNode] = useRecoilState(currentNodeState)
  const {
    filePath: { path },
  } = currentNode
  const { user } = useAuth()
  if (!user) {
    return <></>
  }

  useEffect(() => {
    setCurrentNode(currentNode)
  })

  const loadAnchorsFromNodeId = useCallback(async () => {
    const anchorsFromNode = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    )
    if (anchorsFromNode.success && anchorsFromNode.payload) {
      setAnchors(anchorsFromNode.payload)
    }
  }, [])

  const handleStartLinkClick = () => {
    setPlaying(false)
    if (selectedExtent === undefined) {
      setAlertIsOpen(true)
      setAlertTitle('Cannot start link from this anchor')
      setAlertMessage(
        // eslint-disable-next-line
        'There are overlapping anchors, or this anchor contains other anchors. Before you create this anchor you must remove the other anchors.'
      )
    } else {
      const anchor = {
        anchorId: generateObjectId('anchor'),
        extent: selectedExtent,
        nodeId: currentNode.nodeId,
      }
      setStartAnchor(anchor)
      setIsLinking(true)
    }
  }

  const handleCompleteLinkClick = async () => {
    const anchorsByNodeResp = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    )
    let anchor2: IAnchor | undefined = undefined
    if (
      anchorsByNodeResp.success &&
      anchorsByNodeResp.payload &&
      selectedExtent !== undefined
    ) {
      anchorsByNodeResp.payload?.forEach((nodeAnchor) => {
        if (isSameExtent(nodeAnchor.extent, selectedExtent)) {
          anchor2 = nodeAnchor
        }
        if (
          startAnchor &&
          isSameExtent(nodeAnchor.extent, startAnchor.extent) &&
          startAnchor.nodeId == currentNode.nodeId
        ) {
          setStartAnchor(nodeAnchor)
        }
      })
    }
    if (selectedExtent !== undefined) {
      anchor2 = {
        anchorId: generateObjectId('anchor'),
        extent: selectedExtent,
        nodeId: currentNode.nodeId,
      }
      setEndAnchor(anchor2)
      onCompleteLinkClick()
    }
  }

  const getPermission = async () => {
    let permissionNode: INode
    if (currNode.type === 'map') {
      setPermission('owner')
      return
    }
    if (currNode.type === 'loc') {
      permissionNode = currNode
    } else {
      const parentId = currNode.filePath.path[0]
      const locNodeResp = await FrontendNodeGateway.getNode(parentId)
      if (!locNodeResp.success || !locNodeResp.payload) {
        return
      }
      permissionNode = locNodeResp.payload
    }
    if (!user) {
      return
    }
    // if user is owner
    if (user.uid === (permissionNode as ILocNode).ownerId) {
      setPermission('owner')
      return
    }
    // in read id
    else if ((permissionNode as ILocNode).userReadIds.indexOf(user.uid) > -1) {
      setPermission('read')
      return
    } else if ((permissionNode as ILocNode).userWriteIds.indexOf(user.uid) > -1) {
      setPermission('write')
      return
    }
  }

  useEffect(() => {
    setSelectedAnchors([])
    loadAnchorsFromNodeId()
    getPermission()
  }, [loadAnchorsFromNodeId, currentNode, refreshLinkList, setSelectedAnchors])

  const hasBreadcrumb: boolean = path.length > 1
  const hasAnchors: boolean = anchors.length > 0
  let nodePropertiesWidth: number = hasAnchors ? 200 : 0
  const nodeViewWidth: string = `calc(100% - ${nodePropertiesWidth}px)`

  const nodeProperties = useRef<HTMLHeadingElement>(null)
  const divider = useRef<HTMLHeadingElement>(null)
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
    if (divider.current) divider.current.style.width = '10px'
    if (nodeProperties.current && dragging) {
      const nodePropertiesElement = nodeProperties.current
      let width = parseFloat(nodePropertiesElement.style.width)
      const deltaX = e.screenX - xLast // The change in the x location
      const newWidth = (width -= deltaX)
      if (!(newWidth < 200 || newWidth > 480)) {
        nodePropertiesElement.style.width = String(width) + 'px'
        nodePropertiesWidth = width
        xLast = e.screenX
      }
    }
  }

  const onPointerUp = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = false
    if (divider.current) divider.current.style.width = ''
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
  }

  const getHeader = (perm: string) => {
    console.log(perm)
    switch (perm) {
      case 'owner':
        return (
          <NodeHeader
            onMoveButtonClick={onMoveButtonClick}
            onDeleteButtonClick={onDeleteButtonClick}
            onHandleStartLinkClick={handleStartLinkClick}
            onHandleCompleteLinkClick={handleCompleteLinkClick}
            onCreateNodeButtonClick={onCreateNodeButtonClick}
            onCollaborationButtonClick={onCollaborationButtonClick}
            onShareBtnClick={onShareBtnClick}
            onGraphButtonClick={() => {}}
          />
        )
      case 'read':
        return (
          <ReaderHeader
            onHandleStartLinkClick={handleStartLinkClick}
            onHandleCompleteLinkClick={handleCompleteLinkClick}
            ownerid={(currNode as ILocNode).ownerId}
          />
        )
    }
  }

  return (
    <div className="node">
      <div className="nodeView" style={{ width: nodeViewWidth }}>
        {getHeader(permission)}
        <div className="nodeView-scrollable">
          {hasBreadcrumb && (
            <div className="nodeView-breadcrumb">
              <NodeBreadcrumb path={path} nodeIdsToNodesMap={nodeIdsToNodesMap} />
            </div>
          )}
          <div className="nodeView-content">
            <NodeContent
              childNodes={childNodes}
              onCreateNodeButtonClick={onCreateNodeButtonClick}
            />
          </div>
        </div>
      </div>
      {hasAnchors && (
        <div className="divider" ref={divider} onPointerDown={onPointerDown} />
      )}
      {hasAnchors && (
        <div
          className={'nodeProperties'}
          ref={nodeProperties}
          style={{ width: nodePropertiesWidth }}
        >
          <NodeLinkMenu nodeIdsToNodesMap={nodeIdsToNodesMap} />
        </div>
      )}
    </div>
  )
}
