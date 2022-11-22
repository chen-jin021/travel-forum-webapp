import React from 'react'
import { Editor } from '@tiptap/react'

interface IEditorProps {
  editor: Editor | null
}

export const TextMenu = (props: IEditorProps) => {
  const { editor } = props
  if (!editor) {
    return null
  }

  // TODO: Add all of the functionality for a rich text editor!
  return <div id="textMenu"></div>
}
