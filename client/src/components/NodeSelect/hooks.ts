import { useEffect, useState } from 'react'
import { INode } from '../../types'
import { FrontendNodeGateway } from '../../nodes/FrontendNodeGateway'
import { useAuth } from '../../contexts/AuthContext'

export const useSearchs = (content: string) => {
  const [nodes, setNodes] = useState([] as INode[])

  const { user } = useAuth()

  useEffect(() => {
    if (!content) {
      setNodes([] as INode[])
      return
    }

    const abc = new AbortController()
    ;(async () => {
      const data = await FrontendNodeGateway.searchNodes(
        content,
        user?.uid as string,
        abc.signal
      )

      setNodes(data.payload || [])
    })()

    return () => abc.abort()
  }, [content, user])

  return nodes
}
