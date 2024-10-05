import { Module } from '@nestjs/common'
import {UploadDriverController} from "./upload-driver.controller";
import {UploadDriverService} from "./upload-driver.service";

@Module({
  controllers: [UploadDriverController],
  providers: [UploadDriverService],
})
export class UploadDriverModule {}
