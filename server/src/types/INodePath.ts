import { arrayEquals } from '.'

export default interface INodePath {
  children: string[]
  path: string[]
}

export function makeINodePath(filePath: string[], children?: string[]): INodePath {
  return {
    path: filePath,
    children: children ?? [],
  }
}

/**
 * Determines if a object is a valid FilePath.
 *
 * @param fp any type
 */
export function isINodePath(fp: INodePath | any): fp is INodePath {
  const path = (fp as INodePath).path
  const children = (fp as INodePath).children
  const propsDefinied = path !== undefined && children !== undefined
  if (propsDefinied) {
    // check validity of path
    if (path.length <= 0) {
      return false
    }
    // check validity of children
    if (Array.isArray(children)) {
      children.forEach(function(item) {
        if (typeof item !== 'string') {
          return false
        }
      })
    } else {
      return false
    }
    // check validity of path
    const pathPrefix = path.slice(0, path.length - 1)
    if (pathPrefix.includes(path[path.length - 1])) {
      return false
    }
    const set = new Set(path)
    if (set.size !== path.length) {
      return false
    }
    return true
  }
  return false
}

export function isSameFilePath(fp1: INodePath, fp2: INodePath): boolean {
  return arrayEquals(fp1.children, fp2.children) && arrayEquals(fp1.path, fp2.path)
}
