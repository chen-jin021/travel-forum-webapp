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
