import React, { useEffect, useCallback } from 'react'
import { FolderContentType, IFolderNode, INode } from '../../../../types'
import './FolderContent.scss'
import { GridView } from './GridView'
import { ListView } from './ListView'
import { useSetRecoilState } from 'recoil'
import { selectedExtentState } from '../../../../global/Atoms'

export interface IFolderContentProps {
  childNodes: INode[]
  node: IFolderNode
  onCreateNodeButtonClick: () => unknown
  viewType?: FolderContentType
}

/** Full page view focused on a node's content, with annotations and links */
export const FolderContent = (props: IFolderContentProps) => {
  const { node, childNodes, onCreateNodeButtonClick } = props
  const setSelectedExtent = useSetRecoilState(selectedExtentState)

  // useEffect
  useEffect(() => {
    setSelectedExtent && setSelectedExtent(null)
  }, [])

  const handleSetView = useCallback(() => {
    let nodes
    switch ((node as IFolderNode).viewType) {
      case 'grid':
        nodes = (
          <GridView
            onCreateNodeButtonClick={onCreateNodeButtonClick}
            childNodes={childNodes}
          />
        )
        break
      case 'list':
        nodes = (
          <ListView
            onCreateNodeButtonClick={onCreateNodeButtonClick}
            childNodes={childNodes}
          />
        )
        break
      default:
        nodes = null
        break
    }
    return nodes
  }, [childNodes, node])

  useEffect(() => {
    handleSetView()
  }, [node.viewType, handleSetView])

  return <div className="fullWidthFolder">{handleSetView()}</div>
}
