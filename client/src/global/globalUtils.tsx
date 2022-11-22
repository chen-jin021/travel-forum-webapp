import React from 'react'
import {
  RiFolderLine,
  RiImageLine,
  RiStickyNoteLine,
  RiVideoLine,
  RiFilePdfLine,
  RiQuestionLine,
} from 'react-icons/ri'
import uniqid from 'uniqid'
import { NodeType } from '../types'
import { INodePath } from '../types'

export const nodeTypeIcon = (type: NodeType): JSX.Element => {
  switch (type) {
    case 'text':
      return <RiStickyNoteLine />
    case 'video':
      return <RiVideoLine />
    case 'folder':
      return <RiFolderLine />
    case 'image':
      return <RiImageLine />
    case 'pdf':
      return <RiFilePdfLine />
    default:
      return <RiQuestionLine />
  }
}

export const pathToString = (filePath: INodePath): string => {
  let urlPath: string = ''
  if (filePath.path) {
    for (const id of filePath.path) {
      urlPath = urlPath + id + '/'
    }
  }
  return urlPath
}

/**
 * Helpful for filtering out null and undefined values
 * @example
 * const validNodes = myNodes.filter(isNotNullOrUndefined)
 */
export const isNotNullOrUndefined = (data: any) => {
  return data != null
}

type hypertextObjectType = NodeType | 'link' | 'anchor'

export function generateObjectId(prefix: hypertextObjectType) {
  return uniqid(prefix + '.')
}
