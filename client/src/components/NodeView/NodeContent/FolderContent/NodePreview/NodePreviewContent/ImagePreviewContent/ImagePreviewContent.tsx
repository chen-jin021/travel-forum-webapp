import React from 'react'
import './ImagePreviewContent.scss'

interface IImagePreviewProps {
  content: any
}

/** The content of an image node, including any anchors */
export const ImagePreviewContent = (props: IImagePreviewProps) => {
  const { content } = props

  /**
   * Return the preview container if we are rendering an image preview
   */
  return (
    <div className="imageContent-preview">
      <img src={content} />
    </div>
  )
}
