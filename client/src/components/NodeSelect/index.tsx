import React, { useState } from 'react'
import './select.scss'
import { INode } from '../../types'
import { useSearchs } from './hooks'
import { Link } from 'react-router-dom'
/* eslint-disable */
const renderItem =
  (handle: Function) =>
  ({ nodeId, title, filePath }: INode) => {
    // console.log(filePath)
    return (
      <Link
        to={`/main/${filePath?.path?.join('/')}/`}
        key={`/${filePath?.path?.join('/')}/`}
      >
        <li className="item" onClick={() => handle(nodeId, filePath)}>
          {title}
        </li>
      </Link>
    )
  }

const NodeSelect = () => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const result = useSearchs(search)

  const handleChange = (id: string, filePath?: any) => {
    // TODO: new features
  }

  const onChange = (e: any) => setSearch(e?.target?.value)
  const onSelectChange = (e: any) => setFilter(e.target.value)

  // TODO: change to date picker
  return (
    <>
      {/* type:{' '}
      <select onChange={onSelectChange} value={filter}>
        <option value="all">All</option>
        <option value="text">text</option>
        <option value="image">image</option>
        <option value="video">video</option>
      </select> */}
      <div className="node-select">
        <input
          className="node-select-input"
          placeholder="Search Journal"
          onChange={onChange}
        />
        <ul className="node-select-mention">
          {result
            ?.filter((item) => (filter === 'all' ? true : item.type === filter))
            ?.map?.(renderItem(handleChange))}
        </ul>
      </div>
    </>
  )
}

export default NodeSelect
/* eslint-enable */
