import React from 'react'
import './EditableText.scss'

interface IEditableTextProps {
  text: string
  editing: boolean
  onEdit: (newText: string) => void
  setEditing: (editing: boolean) => void
}

export const EditableText = (props: IEditableTextProps) => {
  const { editing, text, onEdit, setEditing } = props

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onEdit(event.target.value)
  }

  return editing ? (
    <input
      className="editableText"
      autoFocus
      onChange={handleOnChange}
      onBlur={() => setEditing(false)}
      defaultValue={text}
    ></input>
  ) : (
    <div className="displayText">{text}</div>
  )
}
