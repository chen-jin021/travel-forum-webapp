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
import { inherits } from 'util'
import { Image, Box } from '@chakra-ui/react'
interface IPesonalHeaderProps {
  onHomeClick: () => void
}

export const PersonalHeader = (props: IPesonalHeaderProps) => {
  const { onHomeClick } = props
  return (
    <div className="header">
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
          <b>|</b> {'  '} <span style={{ fontStyle: 'italic' }}>About me</span>
        </div>
      </div>
      <div className="right-bar">
        <div>{/* the right bar */}</div>
      </div>
    </div>
  )
}
