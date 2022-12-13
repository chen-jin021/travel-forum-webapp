import React, { useEffect, useState, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { useRecoilState, useRecoilValue } from 'recoil'
import { FrontendAnchorGateway } from '../../../../anchors'
import {
  currentNodeState,
  refreshAnchorState,
  refreshLinkListState,
  refreshState,
  selectedAnchorsState,
  selectedExtentState,
  startAnchorState,
} from '../../../../global/Atoms'
import { FrontendLinkGateway } from '../../../../links'
import { FrontendNodeGateway } from '../../../../nodes'
import {
  Extent,
  failureServiceResponse,
  IAnchor,
  ILink,
  INodeProperty,
  IServiceResponse,
  ITextExtent,
  makeINodeProperty,
  successfulServiceResponse,
} from '../../../../types'
import './TextContent.scss'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import './TextContent.scss'
import { TextMenu } from './TextMenu'

// import from tiptap
import { Link } from '@tiptap/extension-link'
import { Highlight } from '@tiptap/extension-highlight'
import { endpoint } from '../../../../global'
const baseEndpoint = endpoint

interface ITextContentProps {
  inSquare: boolean
}

const LINK_REG = /\<a target\=\"(.*?)\" (.*?)\>(.*?)\<\/a\>/g

const ELE_REG = /\<.*?\>|\<\/.*?\>/g

// here we are parsing the link
const parseLink = (content: string) => {
  let result
  const record = []
  while ((result = LINK_REG.exec(content))) {
    const [element, anchorId, , text] = result
    const startCharacter = result.index
    const endCharacter = startCharacter + text.length

    record.push({ element, anchorId, text, coord: { startCharacter, endCharacter } })
  }

  return record
}

/** The content of an text node, including all its anchors */
export const TextContent = (props: ITextContentProps) => {
  const { inSquare } = props
  const currentNode = useRecoilValue(currentNodeState)
  const startAnchor = useRecoilValue(startAnchorState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const [anchorRefresh, setAnchorRefresh] = useRecoilState(refreshAnchorState)
  const [linkMenuRefresh, setLinkMenuRefresh] = useRecoilState(refreshLinkListState)
  const [selectedAnchors, setSelectedAnchors] = useRecoilState(selectedAnchorsState)
  const [selectedExtent, setSelectedExtent] = useRecoilState(selectedExtentState)
  const [onSave, setOnSave] = useState(false)
  const history = useHistory()

  // const editor = useEditor({
  //   extensions: [
  //     StarterKit,
  //     Link.configure({ openOnClick: true, autolink: false, linkOnPaste: false }),
  //   ],
  //   content: currentNode.content,
  // })
  const box = useMemo(
    () =>
      ({ anchors: [], links: {} } as {
        anchors: IAnchor[]
        links: { [propName: string]: ILink }
      }),
    []
  )
  // creating an instance of the editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true, autolink: false, linkOnPaste: false }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    onBlur: async ({ editor }) => {
      if (!editor?.getText) return
      const text = editor?.getHTML()

      const anchorInfos = parseLink(text)

      const { content, anchors } = anchorInfos?.reduce?.<Record<string, any>>(
        (r, c) => {
          const { content, anchors } = r

          const { element, text, anchorId } = c

          const aIndex = content.indexOf(element) as number

          const startCharacter = content.slice(0, aIndex).replace(ELE_REG, '').length

          if (!startCharacter) return r

          const endCharacter = startCharacter + text.length

          return {
            content: content.replace(element, text),
            anchors: [
              ...anchors,
              { anchorId, extent: { startCharacter, endCharacter, type: 'text', text } },
            ],
          }
        },
        { content: text, anchors: [] }
      )

      const payload = { fieldName: 'content', value: content } as any

      // delete Anchor
      const aliveAnchorIds = anchors.map(({ anchorId }: { anchorId: string }) => anchorId)

      const needDeleteAnchorIds = box.anchors
        .filter((item) => !aliveAnchorIds.includes(item.anchorId))
        .map(({ anchorId }) => anchorId)

      const twoWayNeedDeleteAnchors = Object.entries(box.links)
        .filter(([key]) => needDeleteAnchorIds.includes(key))
        .map(([, { anchor1Id, anchor2Id }]) => [anchor1Id, anchor2Id])
        .flat()

      const deleteTask = FrontendAnchorGateway.deleteAnchors(twoWayNeedDeleteAnchors)

      const updateAnchors = Promise.allSettled(
        (anchors as { anchorId: string; extent: Extent }[]).map(({ anchorId, extent }) =>
          FrontendAnchorGateway.updateExtent(anchorId, extent)
        )
      )

      const update = FrontendNodeGateway.updateNode(currentNode.nodeId, [payload])

      await Promise.allSettled([updateAnchors, update, deleteTask])
      setLinkMenuRefresh(!linkMenuRefresh)
    },
    content: currentNode.content,
  })

  // This function adds anchor marks for anchors in the database to the text editor
  // TODO: Replace 'http://localhost:3000/' with your frontend URL when you're ready to deploy
  const addAnchorMarks = async (): Promise<IServiceResponse<any>> => {
    if (!editor) {
      return failureServiceResponse('no editor')
    }
    const anchorMarks: ITextExtent[] = []
    const anchorResponse = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    )
    if (!anchorResponse || !anchorResponse.success) {
      return failureServiceResponse('failed to get anchors')
    }
    if (!anchorResponse.payload) {
      return successfulServiceResponse('no anchors to add')
    }
    for (let i = 0; i < anchorResponse.payload?.length; i++) {
      const anchor = anchorResponse.payload[i]
      const linkResponse = await FrontendLinkGateway.getLinksByAnchorId(anchor.anchorId)
      if (!linkResponse.success || !linkResponse.payload) {
        return failureServiceResponse('failed to get link')
      }
      box.links[anchor.anchorId] = linkResponse.payload[0] || {}
      const link = linkResponse.payload[0]

      if (!link) continue

      let node = link.anchor1NodeId
      if (node == currentNode.nodeId) {
        node = link.anchor2NodeId
      }
      if (anchor.extent && anchor.extent.type == 'text') {
        editor.commands.setTextSelection({
          from: anchor.extent.startCharacter + 1,
          to: anchor.extent.endCharacter + 1,
        })

        editor.commands.setLink({
          href: baseEndpoint + node + '/',
          target: anchor.anchorId,
        } as any)
      }
    }
    return successfulServiceResponse('added anchors')
  }

  // Set the content and add anchor marks when this component loads
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(currentNode.content)
      addAnchorMarks()
    }
  }, [currentNode, editor])

  // Set the selected extent to null when this component loads
  useEffect(() => {
    setSelectedExtent(null)
  }, [currentNode])

  // Handle setting the selected extent
  const onPointerUp = (e: React.PointerEvent) => {
    if (!editor || inSquare) {
      return <div>{currentNode.content}</div>
    }

    const from = editor.state.selection.from
    const to = editor.state.selection.to
    const text = editor.state.doc.textBetween(from, to)
    if (from !== to) {
      const selectedExtent: Extent = {
        type: 'text',
        startCharacter: from - 1,
        endCharacter: to - 1,
        text: text,
      }
      setSelectedExtent(selectedExtent)
    } else {
      setSelectedExtent(null)
    }
  }

  return (
    <div>
      <div>
        <TextMenu editor={editor} />
        <EditorContent
          style={{ width: '100%', padding: '10px;' }}
          editor={editor}
          onPointerUp={onPointerUp}
        />
      </div>
    </div>
  )
}
