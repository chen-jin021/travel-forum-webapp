import React from 'react'
import { Editor } from '@tiptap/react'
import { AiOutlineUndo } from 'react-icons/ai'
import { IFolderNode, INode, INodeProperty, makeINodeProperty } from '../../../../types'

interface IEditorProps {
  editor: Editor | null
}
/* Component: TextMenu(editor):
  return the JSX of all the manipulation buttons*/
export const TextMenu = (props: IEditorProps) => {
  const { editor } = props

  if (!editor) {
    return null
  }

  // TODO: Add all of the functionality for a rich text editor!
  return (
    <div id="textMenu">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={
          editor.isActive('bold') ? 'active-textEditorButton' : 'textEditorButton bold'
        }
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={
          editor.isActive('italic')
            ? 'active-textEditorButton'
            : 'textEditorButton italic'
        }
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={
          editor.isActive('strike')
            ? 'active-textEditorButton'
            : 'textEditorButton strike'
        }
      >
        Strike
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive('bulletList')
            ? 'active-textEditorButton'
            : 'textEditorButton bulletlist'
        }
      >
        Bullet List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editor.isActive('orderedList')
            ? 'active-textEditorButton'
            : 'textEditorButton orderedlist'
        }
      >
        Ordered List
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        className={
          editor.isActive('undo') ? 'active-textEditorButton' : 'textEditorButton undo'
        }
        disabled={!editor.can().chain().focus().undo().run()}
      >
        Undo
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        className={
          editor.isActive('redo') ? 'active-textEditorButton' : 'textEditorButton redo'
        }
        disabled={!editor.can().chain().focus().redo().run()}
      >
        Redo
      </button>
    </div>
  )
}
