import React, { useState } from 'react'
import { RiArrowRightSLine, RiFolderOpenLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import { nodeTypeIcon, pathToString } from '../../../global'
import { INode, NodeType } from '../../../types'
import { RecursiveNodeTree } from '../../../types/RecursiveNodeTree'
import './TreeViewItem.scss'

interface ITreeViewProps {
  changeUrlOnClick?: boolean
  childNodes: RecursiveNodeTree[]
  node: INode
  parentNode: INode | null
  setParentNode: (node: INode) => void
  title: string
  type: NodeType
}

export const TreeViewItem = ({
  node,
  type,
  title,
  childNodes,
  parentNode,
  setParentNode,
  changeUrlOnClick,
}: ITreeViewProps) => {
  let childrenItems: JSX.Element[] = []
  // glr: why does this not work?
  if (childNodes.length) {
    childrenItems = childNodes.map((child: RecursiveNodeTree) => {
      return changeUrlOnClick ? (
        <Link to={`/${pathToString(child.node.filePath)}`} key={child.node.nodeId}>
          <TreeViewItem
            node={child.node}
            parentNode={parentNode}
            setParentNode={setParentNode}
            type={child.node.type}
            title={child.node.title}
            childNodes={child.children}
            changeUrlOnClick={changeUrlOnClick}
          />
        </Link>
      ) : (
        <TreeViewItem
          node={child.node}
          parentNode={parentNode}
          setParentNode={setParentNode}
          key={child.node.nodeId}
          type={child.node.type}
          title={child.node.title}
          childNodes={child.children}
          changeUrlOnClick={changeUrlOnClick}
        />
      )
    })
  }

  const [isOpen, toggleOpen] = useState(false)
  const toggleFolder = () => {
    toggleOpen(!isOpen)
  }

  const TreeViewChild = () => {
    return (
      <div
        className={`item-wrapper ${isSelected}`}
        onClick={() => {
          setParentNode(node)
        }}
      >
        {hasChildren ? (
          <div className={`icon-hover ${hasChildren}`} onClick={toggleFolder}>
            <div
              className="icon-wrapper"
              style={{
                transform: hasChildren && isOpen ? 'rotate(90deg)' : undefined,
              }}
            >
              {<RiArrowRightSLine />}
            </div>
          </div>
        ) : null}
        <div className={'icon-hover'}>
          <div className="icon-wrapper">{icon}</div>
        </div>
        <div className="text-wrapper">{title}</div>
      </div>
    )
  }
  let icon = nodeTypeIcon(type)
  const hasChildren: boolean = childNodes.length > 0
  const isSelected: boolean = parentNode != null && parentNode.nodeId === node.nodeId
  if (type === 'folder' && isOpen) icon = <RiFolderOpenLine />
  return (
    <div className="treeView-item">
      {changeUrlOnClick ? (
        <Link to={`/${pathToString(node.filePath)}`}>
          <TreeViewChild />
        </Link>
      ) : (
        <TreeViewChild />
      )}
      <div className={`item-children ${isOpen}`}>{childrenItems}</div>
    </div>
  )
}
