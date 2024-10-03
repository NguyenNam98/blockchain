import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile, UploadedFiles,
} from "@nestjs/common";
import { Request, Response } from "express";
import {
  MultiFileUploadInterceptor,
  SingleFileUploadInterceptor
} from "interceptor/fileUpload.interceptor";
import { UploadDriverService } from "./upload-driver.service";
import {ApiHeader, ApiTags} from "@nestjs/swagger";
import {MetaData} from "../../decorators/metaData.decorator";
import * as fs from "fs";
import { createSign, createVerify } from 'crypto';


@ApiTags("upload driver")
@ApiHeader({
  name: 'au-payload',
  schema: {
    default: '{"userId": "2139f7c0-cfaa-4610-9e54-b59f442df88e"}',
  },
})
@Controller({
  path: "file",
  version: "1"
})
export class UploadDriverController
{
  constructor(protected baseUploadService: UploadDriverService) {}

  @Post()
  @MultiFileUploadInterceptor()
  async store(
    @UploadedFiles() files: Express.Multer.File[],
    @MetaData("userId") userId: string
  ): Promise<{
    url: string;
    signature: string;
  }> {
    console.log("userId", userId)
    if (files.length !== 2) {
      throw new BadRequestException('You must upload exactly two files: the file to sign and the private key.');
    }

    // Separate the files: one for the file to sign, the other for the private key
    const fileToSign = files.find(file => file.originalname !== 'private.pem');
    const privateKeyFile = files.find(file => file.originalname === 'private.pem');

    if (!fileToSign || !privateKeyFile) {
      throw new BadRequestException('Please upload a valid file and a private key file named "private.pem".');
    }

    // Read the contents of both files
    const fileData = fs.readFileSync(fileToSign.path);
    const privateKey = fs.readFileSync(privateKeyFile.path, 'utf8');

    // Validate the private key (basic check to ensure it's in PEM format)
    if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      throw new BadRequestException('Invalid private key format');
    }

    // Create a sign object for 'sha256'
    const sign = createSign('sha256');
    sign.update(fileData);
    sign.end();
    let signature = ""

    try {
      // Sign the file with the private key
      signature = sign.sign(privateKey, 'hex');
      // Return the signature
    } catch (error) {
      throw new BadRequestException('Failed to sign the file');
    }

    const uploadedFileUrl = await this.baseUploadService.uploadFile(
        {
          filePath: fileToSign.path,
          originalName: fileToSign.originalname,
          mimeType: fileToSign.mimetype,
        },
        userId,
        signature

    );
    return {
        url: uploadedFileUrl,
        signature: signature
    }

  }

  @Post("/download")
  @SingleFileUploadInterceptor()
  async show(
    @Query("fileId") fileId: string,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @MetaData("userId") userId: string
  ): Promise<void> {
    console.log("userId", userId)

    const publicKey = fs.readFileSync(file.path, 'utf8');
    if (!publicKey.startsWith('-----BEGIN PUBLIC KEY-----')) {
      throw new BadRequestException('Invalid public key format');
    }
    const {
      fileBuffer,
      mimeType,
      signature
    } = await this.baseUploadService.getFile(fileId, userId);
    // Create a verify object for 'sha256'
    const verify = createVerify('sha256');
    verify.update(fileBuffer); // Use the file from the buffer (server-side file)
    verify.end();
    let isValid = false;
    try {
      // Verify the signature using the provided public key
      isValid = verify.verify(publicKey, signature, 'hex');

      // Optionally, delete the uploaded public key file
      fs.unlinkSync(file.path);

    } catch (error) {
      throw new BadRequestException('Failed to verify the file');
    }
    if (!isValid) {
      throw new BadRequestException('Invalid signature');
    }
    const decryptedFile = this.baseUploadService.decryptFile(fileBuffer);
    res.setHeader(
        "Content-Disposition",
        `inline; filename="${fileId}"`
    );
    res.setHeader("Content-Type", mimeType || "image/png");
    res.send(decryptedFile);
  }

  @Get("request-file")
  async requestFile(
    @Query("fileId") fileId: string,
    @MetaData("userId") userId: string
  ): Promise<{}> {
    await this.baseUploadService.requestDownloadFile(fileId, userId);

    return {
    }
  }

  @Get("accept-request")
  async acceptRequest(
      @Query('requestId') requestId:  string ,
      @MetaData("userId") userId: string
  ): Promise<{}> {
    await this.baseUploadService.acceptRequest(requestId, userId);
    return {};
  }

  @Get("reject-request")
  async rejectRequest(
      @Query('requestId') requestId:  string ,
      @MetaData("userId") userId: string
  ): Promise<{}> {
    await this.baseUploadService.rejectRequest(requestId, userId);
    return {};
  }

  @Get("list")
  async getNewList(
      @MetaData("userId") userId: string
  ): Promise<{}> {
    const newFiles = await this.baseUploadService.getNewListFile(userId);
    const myFiles = await this.baseUploadService.getListMyFile(userId);
    const requestedMyFile = await this.baseUploadService.getNewListRequestedFile(userId);
    const acceptedMyRequest = await this.baseUploadService.getAcceptedFiles(userId);
    return {
      newFiles,
      myFiles,
      requestedMyFile,
      acceptedMyRequest
    };
  }

  @Get("list/requested")
  async getNewListRequested(
      @MetaData("userId") userId: string
  ): Promise<{}> {
    // const newFiles =
    return {
      data: []
    };
  }
}
