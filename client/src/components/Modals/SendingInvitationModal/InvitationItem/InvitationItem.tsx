import { Avatar } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { FrontendInvitationGateway } from '../../../../invitations'
import { FrontendNodeGateway } from '../../../../nodes'
import { INode, IUser } from '../../../../types'
import { IInvitation, isInvitation } from '../../../../types/IInvitation'
import { FrontendUserGateway } from '../../../../users'
import { MdPending } from 'react-icons/md'
import { Button, Icon } from '@chakra-ui/react'
import { AiOutlineUndo } from 'react-icons/ai'
import './InvitationItem.scss'

export interface IInvitaionItemProps {
  ivt: IInvitation
}

export const InvitationItem = (props: IInvitaionItemProps) => {
  const { ivt } = props
  const [sender, setSender] = useState<IUser>()
  const [rcver, setRcver] = useState<IUser>()
  const [node, setNode] = useState<INode>()

  const load = async () => {
    const senderResp = await FrontendUserGateway.getUser(ivt.senderId)
    if (!senderResp.success || !senderResp.payload) {
      return
    }
    setSender(senderResp.payload)
    const rcverResp = await FrontendUserGateway.getUser(ivt.rcverId)
    if (!rcverResp.success || !rcverResp.payload) {
      return
    }
    setRcver(rcverResp.payload)
    const nodeResp = await FrontendNodeGateway.getNode(ivt.nodeId)
    if (!nodeResp.success || !nodeResp.payload) {
      return
    }
    setNode(nodeResp.payload)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async () => {
    
  }

  return (
    <div className="ivt-item" key={ivt.inviteId}>
      <div className="left-bar">
        <div>
          <MdPending style={{ display: 'inline' }} /> You invited{' '}
        </div>
        <Avatar
          style={{ marginLeft: '10px', marginRight: '10px' }}
          size={'sm'}
          src={sender?.avatar}
        ></Avatar>
        <div className="ivt-text">
          <span className="emphasis">{sender?.userName}</span>
          &nbsp; {'  to collaborate on'} <span className="emphasis">{node?.title}</span>
        </div>
        <div></div>
      </div>
      <div className="right-bar">
        <Button
          leftIcon={<Icon as={AiOutlineUndo} />}
          colorScheme="red"
          onClick={handleDelete}
        >
          recall
        </Button>
      </div>
    </div>
  )
}
