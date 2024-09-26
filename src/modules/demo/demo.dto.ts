import { IsInt, IsNotEmpty } from 'class-validator'

export class Mt5Dto {
  @IsNotEmpty()
  @IsInt()
  id: number

  @IsNotEmpty()
  type: string
}
