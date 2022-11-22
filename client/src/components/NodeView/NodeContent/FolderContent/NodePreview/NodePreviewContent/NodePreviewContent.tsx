import React from 'react'
import { NodeType } from '../../../../../../types'
import { ImagePreviewContent } from './ImagePreviewContent'
import './NodePreviewContent.scss'
import { TextPreviewContent } from './TextPreviewContent'

/** Props needed to render any node content */
export interface INodeContentPreviewProps {
  content: any
  type: NodeType
}

export const NodePreviewContent = (props: INodeContentPreviewProps) => {
  const { type, content } = props
  switch (type) {
    case 'image':
      return <ImagePreviewContent content={content} />
    case 'text':
      return <TextPreviewContent content={content} />
    default:
      return null
  }
}
