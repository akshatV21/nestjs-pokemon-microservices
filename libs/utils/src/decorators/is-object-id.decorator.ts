import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'
import { Types } from 'mongoose'

export function IsObjectId(validationOptions?: ValidationOptions) {
  const defaultValidationOption: ValidationOptions = {
    message: `$property must be a valid object id string`,
  }

  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsObjectId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions ?? defaultValidationOption,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return Types.ObjectId.isValid(value)
        },
      },
    })
  }
}
