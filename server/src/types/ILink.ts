/** A bidirectional link between two anchors */
export interface ILink {
  anchor1Id: string
  anchor2Id: string
  anchor1NodeId: string
  anchor2NodeId: string
  dateCreated?: Date
  explainer: string
  linkId: string
  title: string
}

export function isILink(object: any): object is ILink {
  return (
    typeof (object as ILink).linkId === 'string' &&
    typeof (object as ILink).anchor1Id === 'string' &&
    typeof (object as ILink).anchor2Id === 'string' &&
    (object as ILink).anchor1Id !== (object as ILink).anchor2Id &&
    typeof (object as ILink).explainer === 'string' &&
    typeof (object as ILink).title === 'string'
  )
}

export function makeILink(
  linkId: string,
  anchor1Id: string,
  anchor2Id: string,
  anchor1NodeId: string,
  anchor2NodeId: string,
  title?: string,
  explainer?: string,
  dateCreated?: Date
): ILink {
  return {
    linkId: linkId,
    anchor1Id: anchor1Id,
    anchor2Id: anchor2Id,
    anchor1NodeId: anchor1NodeId,
    anchor2NodeId: anchor2NodeId,
    title: title ?? '',
    explainer: explainer ?? '',
    dateCreated: dateCreated ?? new Date(),
  }
}

export function isSameLink(l1: ILink, l2: ILink): boolean {
  return (
    l1.linkId === l2.linkId &&
    l1.anchor1Id === l2.anchor1Id &&
    l1.anchor2Id === l2.anchor2Id &&
    l1.title === l2.title &&
    l1.explainer === l2.explainer
  )
}
