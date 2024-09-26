import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common'
import { DemoService } from './demo.service'
import { CustomePipe } from './demo.pipe'
import { Mt5Dto } from './demo.dto'
import { TDemo, TDemoPaging } from './demo.typing'
import { SAParseIntPipe, SAValidationPipe } from '../../app.pipe'
import { ApiHeader, ApiTags } from '@nestjs/swagger'
import { Order, PagingReqDto, TPagingResDto } from '../../app.paging'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'
import {TBaseDto} from "../../app.typing";
import {SaCookies} from "../../decorators/metaData.decorator";
import {User} from "../../entities/common/user.entity";

@ApiTags('demo')
@ApiHeader({
  name: 'au-payload',
  schema: {
    default: '{"userId": 123123123}',
  },
})
@Controller({
  path: 'demo',
  version: '1',
})
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle(2, 60)
  @Get('trade-server')
  async getTradeServer(): Promise<TBaseDto<TDemo>> {
    return {
      data: await this.demoService.getTradeServer(),
    }
  }

  @Get('demoPagination')
  async demoPagination(
    @Query(SAValidationPipe) pagingReqDto: PagingReqDto,
  ): Promise<TBaseDto<TPagingResDto<User>>> {
    console.log('============demoPagination ', pagingReqDto)
    return {
      data: await this.demoService.demoPagination(pagingReqDto),
    }
  }

  @Get('demoPaginationWithoutDto')
  async demoPaginationWithoutDto(): Promise<
    TBaseDto<TPagingResDto<User>>
  > {
    const pagingReqDto = new PagingReqDto(3, Order.DESC)
    console.log('============demoPaginationWithoutDto ', pagingReqDto)
    return {
      data: await this.demoService.demoPagination(pagingReqDto),
    }
  }

  /**
   *
   */
  @Get('demo-error')
  async demoError(@SaCookies() cookies): Promise<TBaseDto<TDemo>> {
    const ts = await this.demoService.demoError(cookies)
    return {
      data: ts,
    }
  }

  /**
   * Example /api/myaccount/v1/mt5/123?sort=true&abc=qwd
   * @param id
   * @param sort
   * @param abc
   */
  @Get(':id')
  async demoQueryParam(
    @Param('id', SAParseIntPipe) id: number,
    @Query('sort', new DefaultValuePipe(false), ParseBoolPipe) sort: boolean,
    @Query('abc', CustomePipe) abc: string,
  ): Promise<TBaseDto<TDemo>> {
    console.log('============demoQueryParam ', id, sort, abc)
    return {
      data: await this.demoService.getTradeServer(),
    }
  }

  @Post()
  @UsePipes(new SAValidationPipe())
  async demoPost(@Body() mt5Dto: Mt5Dto): Promise<TBaseDto<TDemo>> {
    console.log('============demoPost ', mt5Dto)
    return {
      data: await this.demoService.getTradeServer(),
    }
  }
}
