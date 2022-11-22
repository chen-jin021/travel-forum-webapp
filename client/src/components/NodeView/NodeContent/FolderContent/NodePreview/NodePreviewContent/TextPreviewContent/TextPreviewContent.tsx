import React from 'react'
import './TextPreviewContent.scss'

interface ITextPreviewProps {
  content: any
}

/** The content of an text node, including all its anchors */
export const TextPreviewContent = ({ content }: ITextPreviewProps) => {
  return <div className="textContent-preview">{content}</div>
}
