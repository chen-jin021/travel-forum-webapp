import { Extent, isExtent, isSameExtent } from './Extent'

/**
 *  An anchor to be used in links. Consists of a nodeId and the
 *  extent of the anchor in that node
 */
export interface IAnchor {
  anchorId: string
  // Defines the extent of the anchor in the document,
  // e.g. start / end characters in a text node.
  // If extent is null, the anchor points to the node as a whole.
  extent: Extent | null
  nodeId: string
}

export function isIAnchor(object: any): object is IAnchor {
  const propsDefined: boolean =
    typeof (object as IAnchor).anchorId !== 'undefined' &&
    typeof (object as IAnchor).nodeId !== 'undefined' &&
    typeof (object as IAnchor).extent !== 'undefined'
  if (!propsDefined) {
    return false
  }
  // check if all fields have the right type
  // and verify if filePath.path is properly defined
  return (
    typeof (object as IAnchor).anchorId === 'string' &&
    typeof (object as IAnchor).nodeId === 'string' &&
    isExtent(object)
  )
}

export function makeIAnchor(anchorId: string, nodeId: string, extent: Extent) {
  return {
    anchorId: anchorId,
    extent: extent,
    nodeId: nodeId,
  }
}

/**
 * Get a snippet of the content described by an anchor's extent.
 * Return null if there's no user-friendly way to describe an anchor's extent,
 * e.g. for the rectangular selection on an image node.
 */
export const getAnchorContentSnippet = ({
  extent,
  content,
}: {
  content: string
  extent: Extent
}): string | null => {
  if (extent.type === 'text') {
    const { startCharacter, endCharacter } = extent
    return content.slice(startCharacter, endCharacter)
  } else {
    return null
  }
}

export function isSameAnchor(a1: IAnchor, a2: IAnchor): boolean {
  return (
    a1.anchorId === a2.anchorId &&
    a1.nodeId === a2.nodeId &&
    isSameExtent(a1.extent, a2.extent)
  )
}
