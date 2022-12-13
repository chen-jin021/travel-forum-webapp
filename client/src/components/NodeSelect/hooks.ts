import { useEffect, useState } from 'react'
import { INode } from '../../types'
import { FrontendNodeGateway } from '../../nodes/FrontendNodeGateway'
import { useAuth } from '../../contexts/AuthContext'
import { currentNodeState } from '../../global/Atoms'
import { useRecoilValue } from 'recoil'

export const useSearchs = (content: string) => {
  const [nodes, setNodes] = useState([] as INode[])
  const currentNode = useRecoilValue(currentNodeState)

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
      const res = data.payload
      const ret = []
      if (res != null) {
        for (const row of res) {
          if (row.filePath.path[0] == currentNode.nodeId) {
            ret.push(row)
          }
        }
      }
      // console.log(ret)
      setNodes(ret || [])
    })()

    return () => abc.abort()
  }, [content, user])

  return nodes
}
