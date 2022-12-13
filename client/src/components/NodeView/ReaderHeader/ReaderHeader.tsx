import { Avatar, Select } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import * as bi from 'react-icons/bi'
import * as ai from 'react-icons/ai'
import * as ri from 'react-icons/ri'
import { AiOutlineUsergroupAdd, AiOutlineUser, AiOutlineEye } from 'react-icons/ai'
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
import {
  IFolderNode,
  INode,
  INodeProperty,
  IUser,
  makeINodeProperty,
} from '../../../types'
import { Button } from '../../Button'
import { ContextMenuItems } from '../../ContextMenu'
import { EditableText } from '../../EditableText'
import './ReaderHeader.scss'
import { signOut } from 'firebase/auth'
import NodeSelect from '../../NodeSelect'
import { AiOutlineShareAlt } from 'react-icons/ai'
import { FrontendUserGateway } from '../../../users'
import { useHistory } from 'react-router'
import { useAuth } from '../../../contexts/AuthContext'

interface IReaderHeaderProps {
  onHandleCompleteLinkClick: () => void
  onHandleStartLinkClick: () => void
  ownerid: string
  inSquare: boolean
}

export const ReaderHeader = (props: IReaderHeaderProps) => {
  const { onHandleStartLinkClick, onHandleCompleteLinkClick, ownerid, inSquare } = props
  const currentNode = useRecoilValue(currentNodeState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const isLinking = useRecoilValue(isLinkingState)
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)
  const [refreshLinkList, setRefreshLinkList] = useRecoilState(refreshLinkListState)
  const [curUser, setCurUser] = useState<IUser>()
  const history = useHistory()
  const [error, setError] = useState('')
  const { user } = useAuth()

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

  const fetchOwner = async (userId: string) => {
    const ownerResp = await FrontendUserGateway.getUser(ownerid)
    if (!ownerResp.success || !ownerResp.payload) {
      return
    }
    setCurUser(ownerResp.payload)
  }

  /* useEffect which updates the title and editing state when the node is changed */
  useEffect(() => {
    setTitle(currentNode.title)
    setEditingTitle(false)
  }, [currentNode, setEditingTitle])

  useEffect(() => {
    fetchOwner(ownerid)
  }, [ownerid])

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
  const onQuitClick = async () => {
    if (!user) {
      return
    }
    const userId = user.uid
    const deleteUserPermitResp = await FrontendNodeGateway.deleteUserInList(
      currentNode.nodeId,
      userId,
      'read'
    )
    if (!deleteUserPermitResp.success || !deleteUserPermitResp.payload) {
      setError(deleteUserPermitResp.message)
      return
    }
    history.push('/main')
    setSelectedNode(null)
    setRefresh(!refresh)
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
          inSquare={inSquare}
        />
      </div>
      <div className="nodeHeader-buttonBar">
        {notRoot && (
          <>
            {/* <Button
              icon={<ri.RiMenuAddFill />}
              text="Visual"
              onClick={() => onGraphButtonClick(currentNode)}
            /> */}
            <Button icon={<ai.AiFillBackward/>} text="Quit" onClick={onQuitClick} />
            <NodeSelect />
            <div className="readHeader-nameBar">
              <AiOutlineUser />
              Owner: &nbsp; <Avatar src={curUser?.avatar} /> &nbsp; {curUser?.userName}
            </div>
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
      <div className="readHeader-info">
        {' '}
        <AiOutlineEye style={{ display: 'inline' }} />
        &nbsp; You can only read this node
      </div>
    </div>
  )
}
