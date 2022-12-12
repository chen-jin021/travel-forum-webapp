import dayjs from 'dayjs'
import { INode } from '../../../../types'

export const useChunksByDays = (dataSource: INode[]) => {
  const chunks = dataSource.reduce((r, c) => {
    const { dateCreated } = c
    const date = dayjs(dateCreated).format('YYYY-MM-DD')

    if (!r[date]) {
      r[date] = []
    }
    r[date].push(c)

    return r
  }, {} as Record<string, any>)

  const minDay = Object.keys(chunks).reduce(
    (r, c) => (dayjs(c).valueOf() < r ? dayjs(c).valueOf() : r),
    dayjs().valueOf()
  )

  return { chunks, minDay }
}
