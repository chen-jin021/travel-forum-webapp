import { useEffect, useState } from 'react'
import { INode } from '../../types'
import { FrontendNodeGateway } from '../../nodes/FrontendNodeGateway'

export const useSearchs = (content: string) => {
  const [nodes, setNodes] = useState([] as INode[])

  useEffect(() => {
    if (!content) {
      setNodes([] as INode[])
      return
    }

    const abc = new AbortController()
    ;(async () => {
      const data = await FrontendNodeGateway.searchNodes(content, abc.signal)

      setNodes(data.payload || [])
    })()

    return () => abc.abort()
  }, [content])

  return nodes
}
