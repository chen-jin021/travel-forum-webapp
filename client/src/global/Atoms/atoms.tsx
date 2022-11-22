import { atom } from 'recoil'
import { INode, IAnchor, Extent, makeIFolderNode } from '../../types'

// the selected node
export const selectedNodeState = atom<INode | null>({
  key: 'selectedNodeState',
  default: null,
})

// the current node, same as selected node unless selected node is null
export const currentNodeState = atom<INode>({
  key: 'currentNodeState',
  default: makeIFolderNode(
    'root',
    [],
    [],
    'folder',
    'MyHypermedia Dashboard',
    '',
    'grid'
  ),
})

// whether a link is in progress
export const isLinkingState = atom<boolean>({
  key: 'isLinkingState',
  default: false,
})

// signal to refresh webpage
export const refreshState = atom<boolean>({
  key: 'refreshState',
  default: false,
})

// signal to refresh anchors
export const refreshAnchorState = atom<boolean>({
  key: 'refreshAnchorState',
  default: false,
})

// signal to refresh anchors
export const refreshLinkListState = atom<boolean>({
  key: 'refreshLinkListState',
  default: false,
})

// start anchor for link
export const startAnchorState = atom<IAnchor | null>({
  key: 'startAnchorState',
  default: null,
})

// end anchor for link
export const endAnchorState = atom<IAnchor | null>({
  key: 'endAnchorState',
  default: null,
})

// selected anchor(s)
export const selectedAnchorsState = atom<IAnchor[]>({
  key: 'selectedAnchorsState',
  default: [],
})

// selected extent
export const selectedExtentState = atom<Extent | null | undefined>({
  key: 'selectedExtentState',
  default: null,
})

// whether alert is open
export const alertOpenState = atom<boolean>({
  key: 'alertOpenState',
  default: false,
})

// alert title
export const alertTitleState = atom<string>({
  key: 'alertTitleState',
  default: '',
})

// alert message
export const alertMessageState = atom<string>({
  key: 'alertMessageState',
  default: '',
})
