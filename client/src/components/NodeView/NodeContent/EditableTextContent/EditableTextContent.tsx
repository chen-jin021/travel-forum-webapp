import Highlight from '@tiptap/extension-highlight'
import { Link } from '@tiptap/extension-link'
import Typography from '@tiptap/extension-typography'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { FrontendAnchorGateway } from '../../../../anchors'
import {
  alertMessageState,
  alertOpenState,
  alertTitleState,
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
  INodeProperty,
  IServiceResponse,
  ITextExtent,
  makeINodeProperty,
  successfulServiceResponse,
} from '../../../../types'
import './EditableTextContent.scss'
import { TextMenu } from './EditableTextMenu'
// load all highlight.js languages
interface ITextContentProps {}

/** The content of an text node, including all its anchors */
export const EditableTextContent = (props: ITextContentProps) => {
  const currentNode = useRecoilValue(currentNodeState)
  const startAnchor = useRecoilValue(startAnchorState)
  const [refresh, setRefresh] = useRecoilState(refreshState)
  const [anchorRefresh, setAnchorRefresh] = useRecoilState(refreshAnchorState)
  const [linkMenuRefresh, setLinkMenuRefresh] = useRecoilState(refreshLinkListState)
  const [selectedAnchors, setSelectedAnchors] = useRecoilState(selectedAnchorsState)
  const [selectedExtent, setSelectedExtent] = useRecoilState(selectedExtentState)
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)
  const [onSave, setOnSave] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true, autolink: false, linkOnPaste: false }),
      Typography,
      Highlight,
    ],
    content: currentNode.content,
    editable: true,
    injectCSS: false,
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
      const link = linkResponse.payload[0]
      let node = link.anchor1NodeId
      if (node == currentNode.nodeId) {
        node = link.anchor2NodeId
      }
      if (anchor.extent && anchor.extent.type == 'text') {
        editor.commands.setTextSelection({
          from: anchor.extent.startCharacter,
          to: anchor.extent.endCharacter,
        })
        editor.commands.setLink({
          href: 'https://hyperediteablenodes.web.app/' + node + '/',
          target: anchor.anchorId,
        })
      }
    }
    return successfulServiceResponse('added anchors')
  }

  const updateContent = async () => {
    if (!editor) {
      setAlertIsOpen(true)
      setAlertTitle('Content update failed')
      setAlertMessage('Editor does not exist!')
      return failureServiceResponse('Update failed')
    }
    await updateAnchors()
    const html = editor.getHTML()
    const nodeProperty: INodeProperty[] = []
    nodeProperty.push(makeINodeProperty('content', html))
    const contentUpdateResp = await FrontendNodeGateway.updateNode(
      currentNode.nodeId,
      nodeProperty
    )
    if (!contentUpdateResp.success) {
      setAlertIsOpen(true)
      setAlertTitle('Content update failed')
      setAlertMessage(contentUpdateResp.message)
    } else {
      setAlertIsOpen(true)
      setAlertTitle('Successfully saved!')
      setAlertMessage('')
    }
    setRefresh(!refresh)
    setLinkMenuRefresh(!linkMenuRefresh)
  }

  // update still existed anchors , and delete not existed anchors
  const updateAnchors = async () => {
    if (!editor) {
      return
    }
    const anchorsResp = await FrontendAnchorGateway.getAnchorsByNodeId(currentNode.nodeId)
    if (!anchorsResp.success || !anchorsResp.payload) {
      return anchorsResp
    }
    const anchorsInDB: IAnchor[] = anchorsResp.payload
    // convert it to anchorId string list
    const anchorIds: string[] = anchorsInDB.map((value) => {
      return value.anchorId
    })
    const anchorUpdates: string[] = []
    editor.state.doc.descendants(function(node, pos, parent, index) {
      node.marks.forEach(async (mark) => {
        if (
          node.type.name == 'text' &&
          mark.type.name == 'link' &&
          'target' in mark.attrs
        ) {
          anchorUpdates.push(mark.attrs.target)
          if (node.text) {
            const newExtent: ITextExtent = {
              endCharacter: pos + node.text.length,
              startCharacter: pos,
              text: node.text,
              type: 'text',
            }
            const anchorUpdateResp = await FrontendAnchorGateway.updateExtent(
              mark.attrs.target,
              newExtent
            )
            if (!anchorUpdateResp.success) {
              setAlertIsOpen(true)
              setAlertTitle('Cannot update anchors')
              setAlertMessage(anchorUpdateResp.message)
            }
          }
        }
      })
    })
    const deleteIds = anchorIds.filter((value) => {
      return anchorUpdates.indexOf(value) < 0
    })
    const linksResp = await FrontendLinkGateway.getLinksByAnchorIds(deleteIds)
    if (!linksResp.success || !linksResp.payload) {
      return linksResp
    }
    const linkIds: string[] = []
    linksResp.payload.forEach((value) => {
      linkIds.push(value.linkId)
    })
    const deleteResp = await FrontendLinkGateway.deleteLinks(linkIds)
    if (!deleteResp.success || !deleteResp.payload) {
      return deleteResp
    }
  }

  // Set the content and add anchor marks when this component loads
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(currentNode.content)
      editor.commands.selectAll()
      editor.commands.unsetLink()
      addAnchorMarks()
    }
  }, [currentNode, editor])

  useEffect(() => {
    if (editor) {
      editor.commands.selectAll()
      editor.commands.unsetLink()
      addAnchorMarks()
    }
  }, [refresh])

  // Set the selected extent to null when this component loads
  useEffect(() => {
    setSelectedExtent(null)
  }, [currentNode])

  // Handle setting the selected extent
  const onPointerUp = (e: React.PointerEvent) => {
    if (!editor) {
      return
    }
    const from = editor.state.selection.from
    const to = editor.state.selection.to
    const text = editor.state.doc.textBetween(from, to)
    if (from !== to) {
      const selectedExtent: Extent = {
        type: 'text',
        startCharacter: from,
        endCharacter: to,
        text: text,
      }
      setSelectedExtent(selectedExtent)
    } else {
      setSelectedExtent(null)
    }
  }

  if (!editor) {
    return <div>{currentNode.content}</div>
  }

  return (
    <div style={{ width: '700px' }}>
      <TextMenu editor={editor} />
      <EditorContent
        style={{ width: '100%' }}
        editor={editor}
        onPointerUp={onPointerUp}
      />
      <div>
        <div style={{ display: 'inline', fontWeight: 'bold', fontSize: '20px' }}>
          Do not forget to save your text!
        </div>
        <button onClick={updateContent} className={'textEditorButton save'}>
          Save
        </button>
      </div>
    </div>
  )
}
