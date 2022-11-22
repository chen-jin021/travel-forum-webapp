import { NodeFields } from '.'

export interface INodeProperty {
  fieldName: NodeFields
  value: any
}

export function makeINodeProperty(fieldName: NodeFields, newValue: any): INodeProperty {
  return {
    fieldName: fieldName,
    value: newValue,
  }
}
