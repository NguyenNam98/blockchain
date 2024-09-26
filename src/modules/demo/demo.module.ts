import { Module } from '@nestjs/common'
import { DemoController } from './demo.controller'
import { DemoService } from './demo.service'
import {DatabaseModule} from "../../database.module";
import { TypeOrmModule } from '@nestjs/typeorm';
import {User} from "../../entities/common/user.entity";

@Module({
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
