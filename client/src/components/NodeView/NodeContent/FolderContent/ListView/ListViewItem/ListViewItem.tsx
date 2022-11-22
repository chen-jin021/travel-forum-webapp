import React from 'react'
import { Link } from 'react-router-dom'
import { nodeTypeIcon, pathToString } from '../../../../../../global'
import { INode } from '../../../../../../types'
import './ListViewItem.scss'
import { useSetRecoilState } from 'recoil'
import { selectedNodeState } from '../../../../../../global/Atoms'

interface IListViewProps {
  node: INode
}

export const ListViewItem = (props: IListViewProps) => {
  const { node } = props
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  return (
    <Link to={`/${pathToString(node.filePath)}`}>
      <div
        className="listViewItem"
        onClick={() => {
          setSelectedNode(node)
        }}
      >
        <div className="icon">{nodeTypeIcon(node.type)}</div>
        <div className="text">{node.title}</div>
        <div className="text">
          {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
        </div>
        <div className="text">
          {node.dateCreated && new Date(node.dateCreated).toLocaleDateString('en-US')}
        </div>
      </div>
    </Link>
  )
}
