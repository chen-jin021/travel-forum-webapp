import React from 'react'
import { FrontendAnchorGateway } from '../../../anchors'
import { FrontendLinkGateway } from '../../../links'
import { FrontendNodeGateway } from '../../../nodes'
import { Extent, IAnchor, ILink, INode, NodeIdsToNodesMap } from '../../../types'
interface ILinkItemProps {
  link: ILink
  anchorLink: {
    link: ILink
    oppNode: INode
    oppAnchor: IAnchor
  }
  nodeIdsToNodesMap: NodeIdsToNodesMap
  currentNode: INode
  setSelectedNode: (node: INode) => void
  refresh: boolean
  setRefresh: (bool: boolean) => void
}

export interface LocalINodeLinkMenuProps {
  currentNode: INode
  nodeIdsToNodesMap: NodeIdsToNodesMap
}

export const loadAnchorToLinksMap = async (props: LocalINodeLinkMenuProps) => {
  const { currentNode } = props
  const awaitLinks = async () => {
    const anchorsFromNode = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    )
    const anchorToLinksMap: {
      [anchorId: string]: {
        anchor: IAnchor
        links: { link: ILink; oppNode: INode; oppAnchor: IAnchor }[]
      }
    } = {}
    let anchors: IAnchor[] = []
    if (anchorsFromNode.success && anchorsFromNode.payload) {
      anchors = anchorsFromNode.payload
    }
    const linkPromises = []
    for (let i = 0; i < anchors.length; i++) {
      linkPromises.push(FrontendLinkGateway.getLinksByAnchorId(anchors[i].anchorId))
    }
    const values = await Promise.all(linkPromises)

    for (let i = 0; i < values.length; i++) {
      const currAnchorLinks = values[i].payload
      if (currAnchorLinks !== null) {
        const linksArray: { link: ILink; oppNode: INode; oppAnchor: IAnchor }[] = []
        for (let j = 0; j < currAnchorLinks.length; j++) {
          const currLink = currAnchorLinks[j]
          let nodeResp
          let anchorResp
          if (anchors[i].anchorId == currLink.anchor1Id) {
            nodeResp = await FrontendNodeGateway.getNode(currLink.anchor2NodeId)
            anchorResp = await FrontendAnchorGateway.getAnchor(currLink.anchor2Id)
          } else {
            nodeResp = await FrontendNodeGateway.getNode(currLink.anchor1NodeId)
            anchorResp = await FrontendAnchorGateway.getAnchor(currLink.anchor1Id)
          }
          if (
            nodeResp.success &&
            nodeResp.payload &&
            anchorResp.success &&
            anchorResp.payload
          ) {
            linksArray.push({
              link: currLink,
              oppNode: nodeResp.payload,
              oppAnchor: anchorResp.payload,
            })
          }
        }
        anchorToLinksMap[anchors[i].anchorId] = {
          anchor: anchors[i],
          links: linksArray,
        }
      }
    }
    // await fetchNodeIds(linksArray)
    return anchorToLinksMap
  }

  return awaitLinks()
}

export const fetchNodeFromLink = async (props: ILinkItemProps) => {
  const { link, nodeIdsToNodesMap, currentNode, setSelectedNode, refresh, setRefresh } =
    props
  const firstAnchorId = link.anchor1Id
  const secondAnchorId = link.anchor2Id
  const firstAnchor = await FrontendAnchorGateway.getAnchor(firstAnchorId)
  const secondAnchor = await FrontendAnchorGateway.getAnchor(secondAnchorId)
  if (firstAnchor.payload !== null && secondAnchor.payload !== null) {
    const firstNode = nodeIdsToNodesMap[firstAnchor.payload.nodeId]
    const secondNode = nodeIdsToNodesMap[secondAnchor.payload.nodeId]
    if (firstNode?.nodeId === currentNode?.nodeId && secondNode?.nodeId) {
      setSelectedNode(secondNode)
      setRefresh(!refresh)
      return secondNode.nodeId
    } else if (firstNode?.nodeId) {
      setSelectedNode(firstNode)
      setRefresh(!refresh)
      return firstNode.nodeId
    }
  }
}

export const includesAnchorId = (
  anchorId: string,
  selectedAnchors: IAnchor[]
): boolean => {
  let doesInclude: boolean = false
  selectedAnchors?.forEach((anchor) => {
    if (anchor?.anchorId === anchorId) {
      doesInclude = true
    }
  })
  return doesInclude
}

export const getImagePreview = (
  src: string,
  extent: Extent | null,
  maxWidth: number,
  maxHeight: number
): JSX.Element => {
  const scale =
    extent?.type == 'image' &&
    Math.min(maxWidth / extent.width, maxHeight / extent.height)
  return extent?.type == 'image' ? (
    <div className="imagePreviewContainer" style={{ transform: `scale(${scale})` }}>
      <div
        className="imagePreview"
        style={{ height: extent.height, width: extent.width }}
      >
        {
          <img
            src={src}
            style={{
              objectPosition: `${-extent.left + 'px'} ${-extent.top + 'px'}`,
            }}
          ></img>
        }
      </div>
    </div>
  ) : (
    <div></div>
  )
}
