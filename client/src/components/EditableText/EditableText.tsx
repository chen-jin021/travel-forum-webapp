import React from 'react'
import './EditableText.scss'

interface IEditableTextProps {
  text: string
  editing: boolean
  onEdit: (newText: string) => void
  setEditing: (editing: boolean) => void
  isPersonal: boolean
  inSquare: boolean
}

export const EditableText = (props: IEditableTextProps) => {
  const { editing, text, onEdit, setEditing, isPersonal, inSquare } = props

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onEdit(event.target.value)
  }

  const handleOnBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditing(false)
    onEdit(event.target.value)
  }

  return editing ? (
    <input
      className={isPersonal ? 'personal-editableText' : 'editableText'}
      autoFocus
      onChange={() => {
        handleOnChange
      }}
      onBlur={handleOnBlur}
      defaultValue={text}
    ></input>
  ) : (
    <div className="displayText">{text}</div>
  )
}
