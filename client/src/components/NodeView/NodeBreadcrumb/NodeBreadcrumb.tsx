import React from 'react'
import './NodeBreadcrumb.scss'
import { RiArrowRightSLine } from 'react-icons/ri'
import { isNotNullOrUndefined, pathToString } from '../../../global'
import { NodeIdsToNodesMap, INode } from '../../../types'
import { useSetRecoilState } from 'recoil'
import { selectedNodeState } from '../../../global/Atoms'
import { Link } from 'react-router-dom'

export interface INodeBreadcrumbProps {
  nodeIdsToNodesMap: NodeIdsToNodesMap
  path: string[]
}

/** Render a breadcrumb that shows the path from the root to the current node */
export const NodeBreadcrumb = ({ path, nodeIdsToNodesMap }: INodeBreadcrumbProps) => {
  const pathNodes = path
    .map((nodeId: string) => nodeIdsToNodesMap[nodeId])
    .filter(isNotNullOrUndefined)
  if (pathNodes.length === 0) return null
  const parentNodes = pathNodes.slice(0, -1)
  const currentNode = pathNodes[pathNodes.length - 1]
  const setSelectedNode = useSetRecoilState(selectedNodeState)

  return (
    <div className="node-breadcrumb">
      {parentNodes.map((node: INode) => (
        <Link to={`/${pathToString(node.filePath)}`} key={node.nodeId}>
          <div className="breadcrumb-item-wrapper">
            <div className={'breadcrumb-item'} onClick={() => setSelectedNode(node)}>
              {node.title}
            </div>
            <RiArrowRightSLine />
          </div>
        </Link>
      ))}
      <div key={currentNode.nodeId} className={'breadcrumb-item selected'}>
        {currentNode.title}
      </div>
    </div>
  )
}
