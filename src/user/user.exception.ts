import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor() {
    super('User not found', HttpStatus.NOT_FOUND);
  }
}
export class InvalidUserTypeException extends HttpException {
  constructor() {
    super('Invalid user type', HttpStatus.BAD_REQUEST);
  }
}
export class DuplicateElementException extends HttpException {
  constructor(element: string) {
    super(`${element} already in use`, HttpStatus.CONFLICT);
  }
}
