export interface INodePath {
  children: string[]
  path: string[]
}

export function makeINodePath(filePath: string[], children?: string[]): INodePath {
  return {
    children: children ?? [],
    path: filePath,
  }
}
