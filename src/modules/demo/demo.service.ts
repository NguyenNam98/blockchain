import { Injectable } from '@nestjs/common'
import {DataSource} from 'typeorm'
import { TDemo } from './demo.typing'
import { BusinessException } from 'app.exception'
import { DemoError } from './demo.exception'
import { PagingMetaDto, PagingReqDto, TPagingResDto } from '../../app.paging'
import {DatabaseModule} from "../../database.module";
import {DATABASE_NAMES} from "../../app.constant";
import {User} from "../../entities/common/user.entity";
import {InjectDataSource} from "@nestjs/typeorm";

@Injectable()
export class DemoService {
  constructor(
      @InjectDataSource(DatabaseModule.getConnectionName(DATABASE_NAMES.MASTER))
      private masterConnection: DataSource,
  ) {}

  async getTradeServer(): Promise<TDemo> {
    const p = await this.masterConnection
      .getRepository(User)
      .findOneBy({id: "431a6fcb-485e-4568-99b3-d4f670fc27b5"})
    const c = await this.masterConnection.getRepository(User).findOneBy({id: "431a6fcb-485e-4568-99b3-d4f670fc27b5"})
    return { p, c }
  }

  demoError(cookies): TDemo {
    console.log('============demoError ', cookies)
    const businessFailed = true
    if (businessFailed) {
      throw new BusinessException(DemoError.ED002, 'Demo error')
    }
    return {} as TDemo
  }

  async demoPagination(
    pagingReqDto: PagingReqDto,
  ): Promise<TPagingResDto<User>> {
    const queryRunner = this.masterConnection.createQueryRunner('slave')
    try {
      const [data, totalItem] = await queryRunner.manager
        .getRepository(User)
        .findAndCount({
          where: { isValid: true },
          order: { id: pagingReqDto.order },
          select: ['id'],
          skip: pagingReqDto.skip,
          take: pagingReqDto.take,
        })

      return {
        data: data,
        pagingMeta: new PagingMetaDto(pagingReqDto, totalItem),
      }
    } finally {
      await queryRunner.release()
    }
  }
}
