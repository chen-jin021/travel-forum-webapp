import React from 'react'
import { INode } from '../../../../../types'
import { NodePreview } from '../NodePreview'
import './GridView.scss'
import * as ri from 'react-icons/ri'

export interface IGridViewProps {
  childNodes: INode[]
  onCreateNodeButtonClick: () => void
}

/** Full page view focused on a node's content, with annotations and links */
export const GridView = (props: IGridViewProps) => {
  const { childNodes, onCreateNodeButtonClick } = props

  const nodePreviews = childNodes.map(
    (childNode: INode) =>
      childNode && <NodePreview node={childNode} key={childNode.nodeId} />
  )

  return (
    <div className={'gridView-wrapper'}>
      {nodePreviews}
      <div className="grid-newNode" onClick={onCreateNodeButtonClick}>
        <ri.RiAddFill />
      </div>
    </div>
  )
}
