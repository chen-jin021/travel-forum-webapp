import { useRecoilState, useRecoilValue } from 'recoil'
import ReactPlayer from 'react-player/lazy'
import { useRef, useEffect } from 'react'
import { endpoint } from '../../../../global'

import {
  currentNodeState,
  currentPlayerState,
  controlCurrentPlayerState,
  selectedAnchorsState,
} from '../../../../global/Atoms'

export default () => {
  const currentNode = useRecoilValue(currentNodeState)

  const [, setPlayer] = useRecoilState(currentPlayerState)

  const [playing, setPlaying] = useRecoilState(controlCurrentPlayerState)

  const [selected] = useRecoilState(selectedAnchorsState)

  const ref = useRef<any>(null)

  const pause = () => {
    setPlaying(false)
  }

  const resume = () => {
    setPlaying(true)
  }

  const getTime = () => {
    return ref.current.player.prevPlayed
  }

  const { content, nodeId } = currentNode

  useEffect(() => {
    if (!ref.current) return
    setPlayer({
      pause,
      resume,
      getTime,
    })

    return () => setPlayer({})
  }, [ref])

  const onProgress = (e: any) => {
    const { playedSeconds } = e

    localStorage.setItem(`progress_${nodeId}`, playedSeconds)
  }

  useEffect(() => {
    const current = selected.find((item) => item.nodeId === nodeId)

    if (!current || !ref.current) return

    const { extent } = current

    ref.current.seekTo(Number((extent as any).start) || 0)
  }, [selected, ref])

  return (
    <div>
      {/* @ts-ignore */}
      <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '0.7cm' }}>
        Video Memory{' '}
      </div>
      <ReactPlayer
        controls
        ref={ref}
        onProgress={onProgress}
        playing={playing}
        url={`${endpoint}node/video/proxy?location=${encodeURIComponent(content)}`}
      />
    </div>
  )
}
