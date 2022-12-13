import React from 'react'
import { Editor } from '@tiptap/react'
import { useOperation } from './hooks'

interface IEditorProps {
  editor: Editor | null
}

export const TextMenu = (props: IEditorProps) => {
  const { editor } = props

  const btns = useOperation(editor)
  if (!editor) {
    return null
  }

  // TODO: Add all of the functionality for a rich text editor!
  return <div id="textMenu">{btns}</div>
}
