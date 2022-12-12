import React, { useCallback, useState } from 'react'
import { Badge, Calendar, Modal } from 'antd'
import { IFolderNode, INode } from '../../../../types'
import { useChunksByDays } from './hooks'
import dayjs, { Dayjs } from 'dayjs'
import { FolderContent } from '../FolderContent'

type DateContentProps = {
  childNodes: INode[]
  node?: IFolderNode
  onCreateNodeButtonClick?: any
}

const withList = (result: INode[]) => (
  <ul className="events">
    {result.map((item) => (
      <li key={item.nodeId}>
        <Badge status="success" text={item.title} />
      </li>
    ))}
  </ul>
)

// eslint-disable-next-line react/display-name
const dateCellRender = (dataSource: Record<string, INode[]>) => (value: Dayjs) => {
  const date = value.format('YYYY-MM-DD')

  const result = dataSource[date] ?? []
  return withList(result)
}

// eslint-disable-next-line react/display-name
const monthCellRender = (dataSource: Record<string, INode[]>) => (value: Dayjs) => {
  const [result] = Object.entries(dataSource).filter(
    ([time]) => dayjs(time).format('YYYY-MM-DD') === value.format('YYYY-MM-DD')
  )

  if (!result) return <></>

  return withList(result[1])
}

// eslint-disable-next-line react/display-name
export default (props: DateContentProps) => {
  const { childNodes, node, onCreateNodeButtonClick } = props

  const { chunks } = useChunksByDays(childNodes)

  const [visible, setVisible] = useState<boolean>(false)
  const [current, setCurrent] = useState<string>()

  const onSelect = useCallback(
    (day: Dayjs) => {
      const date = day.format('YYYY-MM-DD')

      setCurrent(date)

      if (chunks[date]) setVisible(true)
    },
    [chunks]
  )

  const onCancel = useCallback(() => setVisible(false), [])

  const currentNodes = chunks[current ?? ''] ?? []

  return (
    <>
      <Calendar
        dateCellRender={dateCellRender(chunks)}
        onSelect={onSelect}
        monthCellRender={monthCellRender(chunks)}
      />

      <Modal onOk={onCancel} onCancel={onCancel} open={visible} width={1180}>
        <FolderContent
          node={{ ...node, viewType: 'grid' } as IFolderNode}
          onCreateNodeButtonClick={onCreateNodeButtonClick}
          childNodes={currentNodes as any}
          hideCreate={true}
        />
      </Modal>
    </>
  )
}
