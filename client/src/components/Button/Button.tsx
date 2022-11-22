import React from 'react'
import './Button.scss'

export interface IButtonProps {
  icon?: JSX.Element
  isWhite?: boolean
  onClick?: () => any
  style?: Object
  text?: string
  isActive?: boolean
}

/**
 * This is the button component. It responds to an onClick event.
 *
 * @param props: IButtonProps
 * @returns Button component
 */
export const Button = (props: IButtonProps): JSX.Element => {
  const { icon, text, onClick, style, isWhite, isActive } = props
  return (
    <div
      className={`button ${isActive ? 'active' : ''} ${isWhite ? 'whiteButton' : ''}`}
      onClick={onClick}
      style={style}
    >
      {icon && <div className="icon">{icon}</div>}
      {text && <span className="text">{text}</span>}
    </div>
  )
}
