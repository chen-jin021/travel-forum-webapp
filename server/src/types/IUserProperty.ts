import { userFields, allUserFields } from '.'

export interface IUserProperty {
  fieldName: userFields
  value: any
}

export function makeIUserProperty(fieldName: userFields, newValue: any): IUserProperty {
  return {
    fieldName: fieldName,
    value: newValue,
  }
}

export function isIUserProperty(object: any): boolean {
  const propsDefined: boolean =
    typeof (object as IUserProperty).fieldName !== 'undefined' &&
    typeof (object as IUserProperty).value !== 'undefined'
  if (propsDefined && allUserFields.includes((object as IUserProperty).fieldName)) {
    switch ((object as IUserProperty).fieldName) {
      case 'userId':
        return typeof (object as IUserProperty).value === 'string'
      case 'mail':
        return typeof (object as IUserProperty).value === 'string'
      case 'userName':
        return typeof (object as IUserProperty).value === 'string'
      case 'avatar':
        return typeof (object as IUserProperty).value === 'string'
      default:
        return true
    }
  }
}
