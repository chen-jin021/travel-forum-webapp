import React, { useEffect } from 'react'
import { Button } from '../Button'
import * as ri from 'react-icons/ri'
import * as ai from 'react-icons/ai'
import { BsFillMapFill } from 'react-icons/bs'

import { NodeIdsToNodesMap } from '../../types'
import { Link, useHistory } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { Image } from '@chakra-ui/react'
import {
  isLinkingState,
  startAnchorState,
  selectedExtentState,
  selectedNodeState,
  panoramaState,
} from '../../global/Atoms'
import './SquareHeader.scss'
import { Avatar } from '@chakra-ui/react'
import { useAuth } from '../../contexts/AuthContext'

interface ISquareHeaderProps {
  nodeIdsToNodesMap: NodeIdsToNodesMap
  onHomeClick: () => void
  onPanoramaClick: () => void
  avatarUrl: string
}

export const SquareHeader = (props: ISquareHeaderProps) => {
  const { onHomeClick, nodeIdsToNodesMap, onPanoramaClick, avatarUrl } = props
  const customButtonStyle = { height: 30, marginLeft: 10, width: 30 }
  const [isLinking, setIsLinking] = useRecoilState(isLinkingState)
  const [startAnchor, setStartAnchor] = useRecoilState(startAnchorState)
  const setSelectedExtent = useSetRecoilState(selectedExtentState)
  const [selectedNode, setSelectedNode] = useRecoilState(selectedNodeState)
  const [panorama, setPanorama] = useRecoilState(panoramaState)
  const { user } = useAuth()
  const history = useHistory()

  const handleCancelLink = () => {
    setStartAnchor(null)
    setSelectedExtent(null)
    setIsLinking(false)
  }

  const handleSquareBtnClick = () => {
    history.push('/square')
  }

  return (
    <div className={isLinking ? 'header-linking' : 'header'}>
      <div className="left-bar">
        <Link to={'/main'}>
          <div className="name" onClick={onHomeClick}>
            <Image
              height={'30px'}
              src="https://firebasestorage.googleapis.com/v0/b/hypertextfinalproj.appspot.com/o/utils%2Ffantasy-cty-header-logo.png?alt=media&token=8a421ffe-90ac-4473-83c9-f3623147c697"
            />
          </div>
        </Link>
        <div>
          <b>|</b> {'  '}{' '}
          <span style={{ fontStyle: 'italic', cursor: 'default' }}> Fantasy Square</span>
        </div>
        <Link to={'/main'} style={{ marginLeft: '20px' }}>
          <Button
            isWhite={isLinking}
            style={customButtonStyle}
            icon={<ri.RiHome2Line />}
            onClick={onHomeClick}
          />
        </Link>
        <Button
          isWhite={isLinking}
          style={customButtonStyle}
          icon={panorama ? <ai.AiOutlineEye /> : <ai.AiOutlineEyeInvisible />}
          onClick={onPanoramaClick}
        />
      </div>
      <div className="right-bar">
        {isLinking && startAnchor && (
          <>
            <div>
              Linking from <b>{nodeIdsToNodesMap[startAnchor.nodeId].title}</b>
            </div>
            <Button
              onClick={handleCancelLink}
              isWhite
              text="Cancel"
              style={{ fontWeight: 600, height: 30, marginLeft: 20 }}
              icon={<ri.RiCloseLine />}
            />
          </>
        )}
        <Link to={'/personalInfo'} style={{ marginLeft: '20px' }}>
          <Avatar size={'sm'} src={avatarUrl} />
        </Link>
      </div>
    </div>
  )
}
