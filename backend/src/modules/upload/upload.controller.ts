import { Controller, Post, Body } from '@nestjs/common';
import { UploadService } from './upload.service';
import {UploadDTO} from "./upload.dto";

@Controller('file')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  async uploadFile(
      @Body() data: UploadDTO,
  ): Promise<any> {
    const res = await this.uploadService.uploadFile(data);
    return {
      data: {
        transactionHash: res.transactionHash,
      }
    }
  }

  @Post('request-access')
  async requestAccess(
      @Body('fileId') fileId: string,
      @Body('requesterAddress') requesterAddress: string,
  ): Promise<void> {
    await this.uploadService.requestAccess(fileId, requesterAddress);
  }

  @Post('approve-access')
  async approveAccess(
      @Body('fileId') fileId: string,
      @Body('requestIndex') requestIndex: number,
      @Body('approverAddress') approverAddress: string,
  ): Promise<void> {
    await this.uploadService.approveAccess(fileId, requestIndex, approverAddress);
  }
}
