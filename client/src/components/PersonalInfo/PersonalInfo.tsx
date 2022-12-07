import React, { useCallback } from 'react'
import { PersonalHeader } from '../PersonalHeader'
import { ChakraProvider, Input } from '@chakra-ui/react'
import { useRecoilState } from 'recoil'
import { selectedNodeState } from '../../global/Atoms'

export const PersonalInfo = React.memo(() => {
  const [selectedNode, setSelectedNode] = useRecoilState(selectedNodeState)

  const handleHomeClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  return (
    <>
      <ChakraProvider>
        <PersonalHeader onHomeClick={handleHomeClick}></PersonalHeader>
        <div>cccc</div>
      </ChakraProvider>
    </>
  )
})
