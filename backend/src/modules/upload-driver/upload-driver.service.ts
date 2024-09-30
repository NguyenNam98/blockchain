import { BadRequestException, Injectable } from "@nestjs/common";

import * as qs from "qs";
import {GoogleDriveService, TFile} from "../../services/ggDriver.service";
import {InjectDataSource} from "@nestjs/typeorm";
import {DatabaseModule} from "../../database.module";
import {DATABASE_NAMES} from "../../app.constant";
import {DataSource} from "typeorm";
import {User} from "../../entities/user.entity";
import {File} from "../../entities/file.entity";
import {BusinessException} from "../../app.exception";
import {RequestFile, RequestFileStatus} from "../../entities/requestFile.entity";


const DEFAULT_FILE_TYPE = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const minFileSize = 100;

@Injectable()
export class UploadDriverService  {
  protected _uploadUrlPrefix: string;
  protected _mineType: string[];
  protected _maxFileSize: number = 5; // mb

  constructor(
      @InjectDataSource(DatabaseModule.getConnectionName(DATABASE_NAMES.MASTER))
      private masterConnection: DataSource,
      private s3UploadService : GoogleDriveService
  ) {}
  get urlPrefix(): string {
    return this._uploadUrlPrefix || "/upload";
  }

  get mineType(): string[] {
    return this._mineType || DEFAULT_FILE_TYPE;
  }

  get maxFileSize(): number {
    return this._maxFileSize || 5;
  }
  private generateUploadFileUrl = (key: string, route: string): string => {
    const queryString = qs.stringify({
      key,
    });
    return `${this.urlPrefix}/${route}?${queryString}`;
  };

  /**
   * This method is used to upload a file to the S3 bucket.
   * @param file - The file to be uploaded.
   * @param userId
   * @returns The URL of the uploaded file.
   */
  async uploadFile(
    file: TFile,
    userId: string
  ): Promise<string> {
    // Upload the file to the S3 bucket and get the upload information.
    const userInfo = await this.masterConnection.getRepository(User).findOne({
      where: {
        id: userId
      }
    });
    if (!userInfo) {
      throw new BusinessException("User not found");
    }
    const uploadInfo = await this.s3UploadService.uploadFile(file, {
      keyString: userInfo.symmetricKey,
      ivString: userInfo.ivKey,
    });
    await this.masterConnection.getRepository(File).insert({
      userId: userId,
      fileKey: uploadInfo.key,
      mineType: file.mimeType,
      isValid: true
    });
    const { key } = uploadInfo;
    return key;
  }

  async getFile(key: string): Promise<{
    stream: NodeJS.ReadableStream,
    mineType: string,
    signature: string,
    hash: string
  }> {
    const fileInfor = await this.masterConnection.getRepository(File).findOne({
      where: {
        fileKey: key
      }
    });
    if (!fileInfor) {
      throw new BusinessException("File not found");
    }
    const userInfor = await this.masterConnection.getRepository(User).findOne({
      where: {
        id: fileInfor.userId
      }
    });
    return this.s3UploadService.getFileStream(key, {
      key: userInfor.symmetricKey,
      iv: userInfor.ivKey,
      privateKey: userInfor.privateKey
    });
  }

  async requestDownloadFile(key: string, userId: string): Promise<any> {
    const fileInfor = await this.masterConnection.getRepository(File).findOne({
      where: {
        fileKey: key
      }
    });
    if (!fileInfor) {
      throw new BusinessException("File not found");
    }
    const userInfor = await this.masterConnection.getRepository(User).findOne({
      where: {
        id: userId
      }
    });
    if (!userInfor) {
      throw new BusinessException("User not found");
    }

    await this.masterConnection.getRepository(RequestFile).insert({
      ownerId: fileInfor.userId,
      requesterId: userId,
      fileId: fileInfor.id,
      isValid: true
    })
    return {}
  }

  async acceptRequest(requestFileId: string, userId: string): Promise<any> {

    const userInfor = await this.masterConnection.getRepository(User).findOne({
      where: {
        id: userId
      }
    });
    if (!userInfor) {
      throw new BusinessException("User not found");
    }

    const requestFile = await this.masterConnection.getRepository(RequestFile).findOne({
      where: {
        id: requestFileId,
        ownerId: userId,
        status: RequestFileStatus.PENDING
      }
    })
    if (!requestFile) {
      throw new BusinessException("Request not found");
    }
    await this.masterConnection.getRepository(RequestFile).update({
      id: requestFileId
    }, {
      status: RequestFileStatus.APPROVED
    })
    return {}
  }
  async rejectRequest(requestFileId: string, userId: string): Promise<any> {

    const userInfor = await this.masterConnection.getRepository(User).findOne({
      where: {
        id: userId
      }
    });
    if (!userInfor) {
      throw new BusinessException("User not found");
    }

    const requestFile = await this.masterConnection.getRepository(RequestFile).findOne({
      where: {
        id: requestFileId,
        ownerId: userId,
        status: RequestFileStatus.PENDING
      }
    })
    if (!requestFile) {
      throw new BusinessException("Request not found");
    }
    await this.masterConnection.getRepository(RequestFile).update({
      id: requestFileId
    }, {
      status: RequestFileStatus.REJECTED
    })
    return {}
  }

  validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Bad Request", "File is required");
    }

    if (!this.mineType.includes(file.mimetype)) {
      throw new BadRequestException(
        "Bad Request",
        `Invalid file type. Only ${this.mineType.join(" and ")} are allowed.`
      );
    }

    if (file.size > 1024 * 1024 * this.maxFileSize) {
      throw new BadRequestException(
        "Bad Request",
        `File size exceeds the limit of ${this.maxFileSize}MB.`
      );
    }

    if (file.size < minFileSize) {
      throw new BadRequestException(
        "Bad Request",
        "File is too small. It might be empty or corrupted."
      );
    }
  }
}
