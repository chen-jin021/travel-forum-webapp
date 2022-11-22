import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { generateObjectId } from '../../../global'
import { FrontendLinkGateway } from '../../../links'
import { ILink } from '../../../types'

export async function http<T>(request: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await axios(request)
  return response.data
}

export interface ICompleteLinkModalAttributes {
  /** If null, add node as a root */
  anchor1Id: string
  anchor2Id: string
  explainer: string
  title: string
}

/** Create a new node based on the inputted attributes in the modal */
export async function completestartAnchorModal(
  attributes: ICompleteLinkModalAttributes
): Promise<ILink | null> {
  const { title, explainer, anchor1Id, anchor2Id } = attributes
  const linkId = generateObjectId('link')

  // const newLink: ILink = {
  //   anchor1Id: anchor1Id,
  //   anchor2Id: anchor2Id,
  //   dateCreated: new Date(),
  //   explainer: explainer,
  //   linkId: linkId,
  //   title: title,
  // }

  // const linkResponse = await FrontendLinkGateway.createLink(newLink)
  // if (linkResponse.success) {
  //   return linkResponse.payload
  // } else {
  //   console.error('Error: ' + linkResponse.message)
  //   return null
  // }
  return null
}
