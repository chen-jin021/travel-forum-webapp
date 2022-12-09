// eslint-disable-next-line
import React, { useMemo } from 'react'
import type { Editor } from '@tiptap/react'

export enum OpName {
  // eslint-disable-next-line
  Bold = 'bold',
  // eslint-disable-next-line
  Italic = 'italic',
  // eslint-disable-next-line
  Strike = 'strike',
  // eslint-disable-next-line
  Code = 'code',
  // Heading = 'heading',
  // BulletList = 'bulletList',
  // OrderedList = 'orderedList',
  // eslint-disable-next-line
  Highlight = 'highlight',
}

export const classnames = (...classNames: string[]) => classNames?.join(' ')

const btnClassname = classnames('textEditorButton')

const activeButtonClassname = classnames(btnClassname, 'active-textEditorButton')

class Operation {
  editor: Editor
  constructor(editor: Editor) {
    this.editor = editor
  }

  static fnName = (name: string) => {
    return `toggle${name.replace(/(\S)/, ($0) => $0.toUpperCase())}`
  }

  static exec(editor: Editor, command: any, conf?: Record<string, any>) {
    const result = editor.chain().focus() as unknown as any

    return result[command](conf).run()
  }

  static allowUse(editor: Editor, command: any, conf?: Record<string, any>) {
    const result = editor.can().chain().focus() as any

    return result?.[command]?.(conf)?.run?.()
  }

  static activeCheck(editor: Editor, key: string, conf?: Record<string, any>) {
    return editor.isActive(key, conf) ? activeButtonClassname : btnClassname
  }

  render = (key: OpName) => {
    const fnName = Operation.fnName(key)

    // eslint-disable-next-line no-invalid-this
    const editor = this.editor

    return (
      <button
        onClick={() => Operation.exec(editor, fnName)}
        key={key}
        className={Operation.activeCheck(editor, key)}
      >
        {key}
      </button>
    )
  }

  heading = {
    render: (editor: Editor) => {
      return [1, 2, 3, 4, 5, 6].map((level) => (
        <button
          key={level}
          // eslint-disable-next-line no-invalid-this
          onClick={() => Operation.exec(editor, 'toggleHeading', { level })}
          className={Operation.activeCheck(editor, 'heading', { level })}
        >
          h{level}
        </button>
      ))
    },
  }
}

export /**
 * btns
 *
 * @param {Editor} editor
 * @return {*}
 */
const useOperation = (editor: Editor | null) => {
  const operation = useMemo(() => {
    if (!editor) return
    return new Operation(editor)
  }, [editor]) as any

  if (!editor) return null
  return Object.values(OpName).reduce(
    (r, c) => [...r, operation[c] ? operation[c].render(editor) : operation.render(c)],
    [] as any[]
  )
}
