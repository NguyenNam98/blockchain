import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
} from "@nestjs/common";
import { Request, Response } from "express";
import { FileUploadInterceptor } from "interceptor/fileUpload.interceptor";
import { UploadDriverService } from "./upload-driver.service";
import {ApiTags} from "@nestjs/swagger";
import {MetaData} from "../../decorators/metaData.decorator";

@ApiTags("upload driver")
@Controller({
  path: "file",
  version: "1"
})
export class UploadDriverController
{
  constructor(protected baseUploadService: UploadDriverService) {}

  @Post()
  @FileUploadInterceptor()
  async store(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @MetaData("userId") userId: string
  ): Promise<{
    url: string;
  }> {
    this.baseUploadService.validateFile(file);

    const fileDetail = {
      filePath: file.path,
      originalName: file.originalname,
      mimeType: file.mimetype,
    };

    const uploadedFileUrl = await this.baseUploadService.uploadFile(
      fileDetail, userId
    );
    return {
        url: uploadedFileUrl,
    }

  }

  @Get()
  async show(
    @Query() queryData: { key: string },
    @Res() res: Response,
  ): Promise<void> {
    const { key } = queryData;
    const {
      stream,
      mineType,
      hash,
      signature
    } = await this.baseUploadService.getFile(key);
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${key.split("/").pop()}`
    );
    res.setHeader("Content-Type", mineType || "image/png");
    // res.setHeader("X-File-Hash", hash);
    // res.setHeader("X-File-Signature", signature);

    res.status(200);
    stream.pipe(res);
  }

  @Post("request-file")
  async requestFile(
    @Query() queryData: { key: string },
    @MetaData("userId") userId: string
  ): Promise<{}> {
    await this.baseUploadService.requestDownloadFile(queryData.key, userId);

    return {
    }
  }

  @Put("accept-request")
  async acceptRequest(
      @Query('requestId') requestId:  string ,
      @MetaData("userId") userId: string
  ): Promise<{}> {
    await this.baseUploadService.acceptRequest(requestId, userId);
    return {};
  }

  @Put("reject-request")
  async rejectRequest(
      @Query('requestId') requestId:  string ,
      @MetaData("userId") userId: string
  ): Promise<{}> {
    await this.baseUploadService.rejectRequest(requestId, userId);
    return {};
  }
}
