import { UserFields } from '.'

export interface IUserProperty {
  fieldName: UserFields
  value: any
}

export function makeIUserProperty(fieldName: UserFields, newValue: any): IUserProperty {
  return {
    fieldName: fieldName,
    value: newValue,
  }
}
