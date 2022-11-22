import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from '@chakra-ui/react'
import React, { ReactElement } from 'react'
import './Popover.scss'

interface IPopoverProps {
  content: ReactElement<any, any>
  header?: string
  trigger: ReactElement
}

export const PopoverMenu = ({ content, trigger, header }: IPopoverProps) => {
  return (
    <Popover closeOnEsc={true}>
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent width={120}>
        <PopoverArrow />
        {header && <PopoverHeader>{header}</PopoverHeader>}
        <PopoverBody>{content}</PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
