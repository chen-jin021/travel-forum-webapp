import React from 'react'
import { Button } from '../Button'
import * as ri from 'react-icons/ri'
import * as ai from 'react-icons/ai'

import { NodeIdsToNodesMap } from '../../types'
import { Link } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import {
  isLinkingState,
  startAnchorState,
  selectedExtentState,
  selectedNodeState,
  panoramaState
} from '../../global/Atoms'
import './Header.scss'

interface IHeaderProps {
  nodeIdsToNodesMap: NodeIdsToNodesMap
  onCreateNodeButtonClick: () => void
  onHomeClick: () => void
  onPanoramaClick: () => void 
}

export const Header = (props: IHeaderProps) => {
  const { onCreateNodeButtonClick, onHomeClick, nodeIdsToNodesMap, onPanoramaClick } = props
  const customButtonStyle = { height: 30, marginLeft: 10, width: 30 }
  const [isLinking, setIsLinking] = useRecoilState(isLinkingState)
  const [startAnchor, setStartAnchor] = useRecoilState(startAnchorState)
  const setSelectedExtent = useSetRecoilState(selectedExtentState)
  const [selectedNode, setSelectedNode] = useRecoilState(selectedNodeState)
  const [panorama, setPanorama] = useRecoilState(panoramaState)

  const handleCancelLink = () => {
    setStartAnchor(null)
    setSelectedExtent(null)
    setIsLinking(false)
  }

  return (
    <div className={isLinking ? 'header-linking' : 'header'}>
      <div className="left-bar">
        <Link to={'/main'}>
          <div className="name" onClick={onHomeClick}>
            My<b>Hypermedia</b>
          </div>
        </Link>
        <Link to={'/main'}>
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
          icon={panorama? <ai.AiOutlineEye />:<ai.AiOutlineEyeInvisible/>}
          onClick={onPanoramaClick}
        />
        <Button
          isWhite={isLinking}
          style={customButtonStyle}
          icon={<ai.AiOutlinePlus />}
          onClick={onCreateNodeButtonClick}
        />
      </div>
      {isLinking && startAnchor && (
        <div className="right-bar">
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
        </div>
      )}
    </div>
  )
}
