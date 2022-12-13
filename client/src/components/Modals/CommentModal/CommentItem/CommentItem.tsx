import { Avatar } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { FrontendInvitationGateway } from '../../../../invitations'
import { FrontendNodeGateway } from '../../../../nodes'
import { IMessage, INode, IUser } from '../../../../types'
import { IInvitation, isInvitation } from '../../../../types/IInvitation'
import { FrontendUserGateway } from '../../../../users'
import { MdPending } from 'react-icons/md'
import { Button, Icon } from '@chakra-ui/react'
import { AiOutlineUndo } from 'react-icons/ai'
import './CommentItem.scss'
import { send } from 'process'

export interface ICommentProps {
  msg: IMessage
}

export const CommentItem = (props: ICommentProps) => {
  const { msg } = props
  const [sender, setSender] = useState<IUser>()

  const load = async () => {
    const senderResp = await FrontendUserGateway.getUser(msg.userId)
    if (!senderResp.success || !senderResp.payload) {
      return
    }
    setSender(senderResp.payload)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <div className="msg">
        <div className="msg-name" key={msg.messageId}>
          <div className="left-bar">
            <Avatar
              style={{ marginLeft: '10px', marginRight: '10px' }}
              size={'sm'}
              src={sender?.avatar}
            ></Avatar>
            <div className="ivt-text">
              <div className="emphasis">{sender?.userName}</div>
            </div>
          </div>
          <div className="right-bar">
            {new Date(msg.dateCreated).toLocaleDateString('en-US')}
          </div>
        </div>
        <div className="comment-info">{msg.information}</div>
      </div>
    </>
  )
}
