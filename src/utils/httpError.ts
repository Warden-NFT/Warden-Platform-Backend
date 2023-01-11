import { HttpException, HttpStatus } from '@nestjs/common';

export const throwBadRequestError = (error: Error) => {
  throw new HttpException(
    {
      statusCode: HttpStatus.BAD_REQUEST,
      message: error.message,
    },
    HttpStatus.BAD_REQUEST,
  );
};
