import { INode } from '.'

export class RecursiveNodeTree {
  node: INode
  children: RecursiveNodeTree[]

  constructor(node: INode) {
    this.node = node
    this.children = []
  }

  addChild(child: RecursiveNodeTree) {
    this.children.push(child)
  }
}

export function traverseTree(
  tree: RecursiveNodeTree,
  callback: (tree: RecursiveNodeTree) => void
) {
  callback(tree)
  if (tree.children) {
    tree.children.map((child) => traverseTree(child, callback))
  }
}
