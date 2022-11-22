import { INode, makeIFolderNode, makeINode, NodeIdsToNodesMap } from '../../types'
import { traverseTree, RecursiveNodeTree } from '../../types/RecursiveNodeTree'

export const createNodeIdsToNodesMap = (rootNodes: any) => {
  const result: NodeIdsToNodesMap = {}
  for (const root of rootNodes) {
    traverseTree(root, (tree) => {
      result[tree.node.nodeId] = tree.node
    })
  }
  return result
}

export const makeRootWrapper = (rootNodes: any) => {
  const rootRecursiveNodeTree: RecursiveNodeTree = {
    addChild: () => null,
    children: rootNodes,
    node: makeIFolderNode('root', [], [], 'folder', 'MyHypermedia Dashboard', '', 'grid'),
  }
  return rootRecursiveNodeTree
}

export const emptyNode: INode = makeINode('', [])
