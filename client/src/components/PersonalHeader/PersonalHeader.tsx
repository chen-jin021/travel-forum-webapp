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
  panoramaState,
} from '../../global/Atoms'
import './Header.scss'


interface IPesonalHeaderProps {
  onHomeClick: () => void
}



export const PersonalHeader = (props: IPesonalHeaderProps) => {
  const {onHomeClick} = props
  return (
    <div className="header">
      <div className="left-bar">
        <Link to={'/main'}>
          <div className="name" onClick={onHomeClick}>
            <b>Fantasy City</b>
          </div>
        </Link>
      </div>
      <div className="right-bar">
        <div>{/* the right bar */}</div>
      </div>
    </div>
  )
}
