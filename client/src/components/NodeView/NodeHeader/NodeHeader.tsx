import { Select } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import * as bi from 'react-icons/bi'
import * as ai from 'react-icons/ai'
import * as ri from 'react-icons/ri'
import { AiOutlineUsergroupAdd } from 'react-icons/ai'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  alertMessageState,
  alertOpenState,
  alertTitleState,
  currentNodeState,
  isLinkingState,
  refreshLinkListState,
  refreshState,
  selectedNodeState,
} from '../../../global/Atoms'
import { FrontendNodeGateway } from '../../../nodes'
import { IFolderNode, INode, INodeProperty, makeINodeProperty } from '../../../types'
import { Button } from '../../Button'
import { ContextMenuItems } from '../../ContextMenu'
import { EditableText } from '../../EditableText'
import './NodeHeader.scss'
import { signOut } from 'firebase/auth'
import NodeSelect from '../../NodeSelect'

interface INodeHeaderProps {
  onHandleCompleteLinkClick: () => void
  onHandleStartLinkClick: () => void
  onDeleteButtonClick: (node: INode) => void
  onMoveButtonClick: (node: INode) => void
  onCreateNodeButtonClick: () => void
  onCollaborationButtonClick: () => void
  onGraphButtonClick: () => void
  onShareBtnClick: () => void
}

export const NodeHeader = (props: INodeHeaderProps) => {
  const {
    onDeleteButtonClick,
    onMoveButtonClick,
    onGraphButtonClick,
    onHandleStartLinkClick,
    onHandleCompleteLinkClick,
    onCollaborationButtonClick,
    onCreateNodeButtonClick,
    onShareBtnClick,
  } = props
  const currentNode = useRecoilValue(currentNodeState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const isLinking = useRecoilValue(isLinkingState)
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)
  const [refreshLinkList, setRefreshLinkList] = useRecoilState(refreshLinkListState)

  // State variable for current node title
  const [title, setTitle] = useState(currentNode.title)
  // State variable for whether the title is being edited
  const [editingTitle, setEditingTitle] = useState<boolean>(false)

  /* Method to update the current folder view */
  const handleUpdateFolderView = async (e: React.ChangeEvent) => {
    const nodeProperty: INodeProperty = makeINodeProperty(
      'viewType',
      (e.currentTarget as any).value as any
    )
    const updateViewResp = await FrontendNodeGateway.updateNode(currentNode.nodeId, [
      nodeProperty,
    ])
    if (updateViewResp.success) {
      setSelectedNode(updateViewResp.payload)
    } else {
      setAlertIsOpen(true)
      setAlertTitle('View not updated')
      setAlertMessage(updateViewResp.message)
    }
  }

  /* Method to update the node title */
  const handleUpdateTitle = async (title: string) => {
    // TODO: Task 8 - node title
    const newTitle = makeINodeProperty('title', title)
    const updateTitleResp = await FrontendNodeGateway.updateNode(currentNode.nodeId, [
      newTitle,
    ])
    console.log('The new title is: ' + title)
    if (!updateTitleResp.success) {
      setAlertIsOpen(true)
      setAlertTitle('Title not updated')
      setAlertMessage(updateTitleResp.message)
    }
    setRefresh(!refresh)
    setRefreshLinkList(!refreshLinkList)
  }

  /* Method called on title right click */
  const handleTitleRightClick = () => {
    // TODO: Task 9 - context menu
    ContextMenuItems.splice(0, ContextMenuItems.length)

    const menuItem: JSX.Element = (
      <div
        key={'titleRename'}
        className="contextMenuItem"
        onClick={(e) => {
          ContextMenuItems.splice(0, ContextMenuItems.length)
          setEditingTitle(true)
        }}
      >
        <div className="itemTitle">Rename</div>
        <div className="itemShortcut">ctrl + shift + R</div>
      </div>
    )
    ContextMenuItems.push(menuItem)
  }

  /* useEffect which updates the title and editing state when the node is changed */
  useEffect(() => {
    setTitle(currentNode.title)
    setEditingTitle(false)
  }, [currentNode, setEditingTitle])

  /* Node key handlers*/
  const nodeKeyHandlers = (e: KeyboardEvent) => {
    // TODO: Task 9 - keyboard shortcuts
    // determine user's
    // eslint-disable-next-line
    let os: string = ''
    // eslint-disable-next-line
    if (navigator.userAgent.indexOf('Win') != -1) os = 'win'
    // eslint-disable-next-line
    if (navigator.userAgent.indexOf('Mac') != -1) os = 'mac'
    // eslint-disable-next-line
    if (navigator.userAgent.indexOf('X11') != -1) os = 'x11'
    // eslint-disable-next-line
    if (navigator.userAgent.indexOf('Linux') != -1) os = 'linux'

    // key handlers with no modifiers
    switch (e.key) {
      case 'Enter':
        if (editingTitle == true) {
          e.preventDefault()
          setEditingTitle(false)
        }
        break
      case 'Escape':
        if (editingTitle == true) {
          e.preventDefault()
          setEditingTitle(false)
        }
        break
    }

    // ctrl + shift key events
    if (e.shiftKey && e.ctrlKey) {
      switch (e.key) {
        case 'R':
          // prevent the default behavior - refresh the page
          e.preventDefault()
          setEditingTitle(true)
          break
      }
    }
  }

  // Trigger on node load or when editingTitle changes
  useEffect(() => {
    // TODO: Task 9 - keyboard shortcuts
    // make sure this component is always looking for keydown event
    document.addEventListener('keydown', nodeKeyHandlers)
    // prevent the default system behaviors
  }, [editingTitle])

  const folder: boolean = currentNode.type === 'folder'
  const notRoot: boolean = currentNode.nodeId !== 'root'
  return (
    <div className="nodeHeader">
      <div
        className="nodeHeader-title"
        onDoubleClick={(e) => setEditingTitle(true)}
        onContextMenu={handleTitleRightClick}
      >
        <EditableText
          text={title}
          editing={editingTitle}
          setEditing={setEditingTitle}
          onEdit={handleUpdateTitle}
          isPersonal={false}
        />
      </div>
      <div className="nodeHeader-buttonBar">
        {notRoot && (
          <>
            <Button
              isWhite={isLinking}
              text="Create"
              icon={<ai.AiOutlinePlus />}
              onClick={onCreateNodeButtonClick}
            />

            {/* <Button
              icon={<ri.RiMenuAddFill />}
              text="Visual"
              onClick={() => onGraphButtonClick(currentNode)}
            /> */}

            <Button
              icon={<ri.RiDeleteBin6Line />}
              text="Delete"
              onClick={() => onDeleteButtonClick(currentNode)}
            />
            <Button
              icon={<ri.RiExternalLinkLine />}
              text="Start Link"
              onClick={onHandleStartLinkClick}
            />

            <Button
              icon={<AiOutlineUsergroupAdd />}
              text="Collaboration"
              onClick={onCollaborationButtonClick}
            />

            {isLinking && (
              <Button
                text="Complete Link"
                icon={<bi.BiLinkAlt />}
                onClick={onHandleCompleteLinkClick}
              />
            )}
            <NodeSelect />
            {folder && (
              <div className="select">
                <Select
                  bg="f1f1f1"
                  defaultValue={(currentNode as IFolderNode).viewType}
                  onChange={handleUpdateFolderView}
                  height={35}
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </Select>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
