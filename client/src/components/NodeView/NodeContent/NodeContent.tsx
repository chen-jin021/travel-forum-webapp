import React, { useState } from 'react'
import { useRecoilValue } from 'recoil'
import { currentNodeState } from '../../../global/Atoms'
import { IFolderNode, INode } from '../../../types'
import { FolderContent } from './FolderContent'
import { ImageContent } from './ImageContent'
import './NodeContent.scss'
import { TextContent } from './TextContent'
import VideoContent from './VideoContent'
import DateContent from './DateContent'
import { message, Popconfirm, Switch } from 'antd'

/** Props needed to render any node content */

export interface INodeContentProps {
  childNodes?: INode[]
  onCreateNodeButtonClick: () => void
  inSquare: boolean
}

/**
 * This is the node content.
 *
 * @param props: INodeContentProps
 * @returns Content that any type of node renders
 */
export const NodeContent = (props: INodeContentProps) => {
  const { inSquare } = props
  const { onCreateNodeButtonClick, childNodes } = props
  const currentNode = useRecoilValue(currentNodeState)
  const [open, setOpen] = useState(false)
  const [condition, setCondition] = useState(true)
  const [switchOnCal, setSwitchOnCal] = useState(true)

  const changeCondition = (checked: boolean) => {
    setSwitchOnCal(!switchOnCal) // toggle
  }
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setOpen(newOpen)
      return
    }
    // Determining condition before show the popconfirm.
    console.log(condition)
    if (condition) {
      confirm() // next step
    } else {
      setOpen(newOpen)
    }
  }
  const cancel = () => {
    setOpen(false)
    message.error('Click on cancel.')
  }

  const confirm = () => {
    setOpen(false)
    if (switchOnCal) message.success('Square is turned off.')
    else message.success('Square is turned on.')
  }

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
      }
      break
    case 'loc': {
      return (
        <div className="loc-view">
          <div className="switch-btn">
            {!inSquare && switchOnCal && (
              <div>
                <span className="timeline-switch"> Timeline Off </span>
                <Switch defaultChecked onChange={changeCondition} />
              </div>
            )}
            {!inSquare && !switchOnCal && (
              <div>
                <span className="timeline-switch"> Timeline On </span>
                <Switch defaultChecked onChange={changeCondition} />
              </div>
            )}
          </div>

          {!inSquare && switchOnCal && (
            <DateContent
              childNodes={childNodes ?? []}
              onCreateNodeButtonClick={onCreateNodeButtonClick}
              node={{ ...currentNode, viewType: 'grid' } as IFolderNode}
            />
          )}
          {
            <FolderContent
              node={{ ...currentNode, viewType: 'grid' } as IFolderNode}
              onCreateNodeButtonClick={onCreateNodeButtonClick}
              childNodes={childNodes as any}
            />
          }
        </div>
      )
    }
  }
  return null
}
