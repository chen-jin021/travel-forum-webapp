// import marked from 'marked'
import { FrontendAnchorGateway } from '../../../../anchors'
import { FrontendLinkGateway } from '../../../../links'
import { IAnchor, ILink } from '../../../../types'

// export const markdownToHtml = (markdown: string) => {
//   return marked(markdown)
// }

export const fetchLinks = async (href: string): Promise<ILink[]> => {
  if (!href.includes('anchor')) {
    window.open(href, '_blank')
    return []
  }
  const linksResp = await FrontendLinkGateway.getLinksByAnchorId(href)
  if (linksResp.success && linksResp.payload) {
    const links = linksResp.payload
    return links
  }
  return []
}

export const fetchAnchors = async (links: ILink[]): Promise<IAnchor[]> => {
  if (links[0]) {
    const anchorResp = await FrontendAnchorGateway.getAnchors([
      links[0].anchor1Id,
      links[0].anchor2Id,
    ])
    if (anchorResp.success && anchorResp.payload) {
      return anchorResp.payload
    }
  }
  return []
}
