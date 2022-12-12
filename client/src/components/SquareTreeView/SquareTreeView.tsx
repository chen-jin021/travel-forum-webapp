import React from 'react'
import { INode } from '../../types'
import { RecursiveNodeTree } from '../../types/RecursiveNodeTree'
import { SquareTreeViewItem } from './SquareTreeViewItem'
import './TreeView.scss'

export interface ISquareTreeViewProps {
  changeUrlOnClick?: boolean
  roots: RecursiveNodeTree[]
  parentNode: INode | null
  setParentNode: (node: INode) => void
}

export const SquareTreeView = (props: ISquareTreeViewProps) => {
  const { roots, parentNode, setParentNode, changeUrlOnClick = true } = props
  return (
    <div className="treeView-wrapper">
      {roots.map((tree: RecursiveNodeTree) => (
        <SquareTreeViewItem
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
