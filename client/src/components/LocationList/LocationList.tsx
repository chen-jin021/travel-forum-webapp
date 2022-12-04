import React from 'react'
import { INode } from '../../types'
import { RecursiveNodeTree } from '../../types/RecursiveNodeTree'
import { TreeViewItem } from './TreeViewItem'
import './TreeView.scss'
import { IListViewProps } from '../NodeView/NodeContent/FolderContent/ListView'

export interface ILocationProps {
  changeUrlOnClick?: boolean
  roots: RecursiveNodeTree[]
  parentNode: INode | null
  setParentNode: (node: INode) => void
}

export const LocationList = (props: ILocationProps) => {
  const { roots, parentNode, setParentNode, changeUrlOnClick = true } = props
  return (
    <div className="treeView-wrapper">
      {roots.map((tree: RecursiveNodeTree) => (
        <TreeViewItem
          node={tree.node}
          parentNode={parentNode}
          setParentNode={setParentNode}
          key={tree.node.nodeId}
          type={tree.node.type}
          title={tree.node.title}
          childNodes={tree.children}
          changeUrlOnClick={changeUrlOnClick}
        />
      ))}
    </div>
  )
}
