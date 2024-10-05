import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator'

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PagingReqDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order: Order = Order.ASC

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page: number = 1

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 20,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  readonly limit: number = 10

  @Expose()
  get skip(): number {
    return this.limit * (this.page - 1)
  }

  @Expose()
  public get take(): number {
    return this.limit
  }

  constructor(page: number, order?: Order, limit?: number) {
    this.page = page || 1
    order && (this.order = order)
    limit && (this.limit = limit)
  }
}

export class PagingMetaDto {
  @ApiProperty()
  readonly page: number

  @ApiProperty()
  readonly limit: number

  @ApiProperty()
  readonly totalItem: number

  @ApiProperty()
  readonly totalPage: number

  @ApiProperty()
  readonly hasPreviousPage: boolean

  @ApiProperty()
  readonly hasNextPage: boolean

  constructor(pagingReqDto: PagingReqDto, totalItem: number) {
    this.page = pagingReqDto.page
    this.limit = pagingReqDto.limit
    this.totalItem = totalItem
    this.totalPage = Math.ceil(this.totalItem / this.limit)
    this.hasPreviousPage = this.page > 1
    this.hasNextPage = this.page < this.totalPage
  }
}

export interface TPagingResDto<T> {
  data: T[]
  pagingMeta: PagingMetaDto
}
