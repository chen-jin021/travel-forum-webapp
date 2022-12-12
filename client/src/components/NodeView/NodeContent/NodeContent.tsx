import React from 'react'
import { useRecoilValue } from 'recoil'
import { currentNodeState } from '../../../global/Atoms'
import { IFolderNode, INode } from '../../../types'
import { FolderContent } from './FolderContent'
import { ImageContent } from './ImageContent'
import './NodeContent.scss'
import { TextContent } from './TextContent'
import VideoContent from './VideoContent'

/** Props needed to render any node content */

export interface INodeContentProps {
  childNodes?: INode[]
  onCreateNodeButtonClick: () => void
}

/**
 * This is the node content.
 *
 * @param props: INodeContentProps
 * @returns Content that any type of node renders
 */
export const NodeContent = (props: INodeContentProps) => {
  const { onCreateNodeButtonClick, childNodes } = props
  const currentNode = useRecoilValue(currentNodeState)

  switch (currentNode.type) {
    case 'image':
      return <ImageContent />
    case 'text':
      return <TextContent />
    case 'video':
      return <VideoContent />
    case 'map':
      return <></>
    case 'folder':
      if (childNodes) {
        return (
          <FolderContent
            node={currentNode as IFolderNode}
            onCreateNodeButtonClick={onCreateNodeButtonClick}
            childNodes={childNodes}
          />
        )
      } else {
        return <></>
      }
    case 'loc': {
      return (
        <FolderContent
          node={{ ...currentNode, viewType: 'grid' } as IFolderNode}
          onCreateNodeButtonClick={onCreateNodeButtonClick}
          childNodes={childNodes as any}
        />
      )
    }
  }
  return null
}
