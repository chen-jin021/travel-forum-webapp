import React, { useCallback, useEffect, useState } from 'react'
import './ContextMenu.scss'

const useContextMenu = () => {
  const [xPos, setXPos] = useState('0px')
  const [yPos, setYPos] = useState('0px')
  const [showMenu, setShowMenu] = useState(false)

  const handleContextMenu = useCallback(
    (e) => {
      if (ContextMenuItems.length > 0) {
        e.preventDefault()
        setXPos(`${e.pageX}px`)
        setYPos(`${e.pageY}px`)
        setShowMenu(true)
      }
    },
    [setXPos, setYPos]
  )

  const keyHandlers = useCallback(
    (e: KeyboardEvent) => {
      if (e.key == 'Escape') {
        showMenu && setShowMenu(false)
        ContextMenuItems.splice(0, ContextMenuItems.length)
      }
    },
    [showMenu]
  )

  const handleClick = useCallback(() => {
    showMenu && setShowMenu(false)
    ContextMenuItems.splice(0, ContextMenuItems.length)
  }, [showMenu])

  useEffect(() => {
    document.addEventListener('click', handleClick)
    document.removeEventListener('keydown', keyHandlers)
    document.addEventListener('contextmenu', handleContextMenu)
    return () => {
      document.addEventListener('keydown', keyHandlers)
      document.addEventListener('click', handleClick)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [ContextMenuItems])

  return { xPos, yPos, showMenu }
}

export const ContextMenuItems: JSX.Element[] = []

export const ContextMenu = () => {
  const { xPos, yPos, showMenu } = useContextMenu()

  return showMenu ? (
    <div
      className="menu-container"
      style={{
        top: yPos,
        left: xPos,
      }}
    >
      {ContextMenuItems}
    </div>
  ) : (
    <></>
  )
}
