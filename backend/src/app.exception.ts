export abstract class BaseException extends Error {
  public error: string

  constructor(error: string, message?: any) {
    super(message)
    this.error = error
    this.message = message
  }
}

export class BusinessException extends BaseException {
  constructor(error: string, message?: any) {
    super(message)
    this.error = error
    this.message = message
  }
}

export enum AppError {
  // error common bad request
  ECB001 = 'ECB001',
  // error common internal error
  ECI500 = 'ECI500',
  // error unauthorized
  EUA001 = 'EUA001',
  // error entity not found
  ECB404 = 'ECB404',
}
