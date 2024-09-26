import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { DemoService } from './demo.service'
import { AppError } from '../../app.exception'

@Injectable()
export class CustomePipe implements PipeTransform<string> {
  /**
   * Return value case valid value
   * throw new Exception case invalid value
   * */
  transform(value) {
    throw new BadRequestException('Bad Request', AppError.ECB001)
    return value
  }
}

@Injectable()
export class ValidatePostPipe implements PipeTransform<any> {
  constructor(private readonly appService: DemoService) {}

  async transform(value) {
    console.log(
      '============transform ',
      value,
      await this.appService.getTradeServer()
    )
    throw new BadRequestException('Bad Request', AppError.ECB001)
    return value
  }
}
