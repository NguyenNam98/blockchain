import { BadRequestException, Injectable } from "@nestjs/common";

import * as qs from "qs";
import {GoogleDriveService, TFile} from "../../services/ggDriver.service";
import {InjectDataSource} from "@nestjs/typeorm";
import {DatabaseModule} from "../../database.module";
import {DATABASE_NAMES} from "../../app.constant";
import {DataSource, Equal, In, Not} from "typeorm";
import {User} from "../../entities/user.entity";
import {File} from "../../entities/file.entity";
import {BusinessException} from "../../app.exception";
import {RequestFile, RequestFileStatus} from "../../entities/requestFile.entity";
import {EncryptionService} from "../../services/crypto.service";
import {Web3Service} from "../../services/web3.service";


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
      private s3UploadService : GoogleDriveService,
      private encryptionService : EncryptionService,
      private web3Service: Web3Service
  ) {}

  get mineType(): string[] {
    return this._mineType || DEFAULT_FILE_TYPE;
  }

  get maxFileSize(): number {
    return this._maxFileSize || 5;
  }

  /**
   * This method is used to upload a file to the S3 bucket.
   * @param file - The file to be uploaded.
   * @param userId
   * @param signature
   * @returns The URL of the uploaded file.
   */
  async uploadFile(
    file: TFile,
    userId: string,
    signature: string
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

    // upload to driver
    const uploadInfo = await this.s3UploadService.uploadFile(file);
    // save to db
    const newFile = await this.masterConnection.getRepository(File).insert({
      userId: userId,
      mineType: file.mimeType,
      isValid: true,
      fileKey: uploadInfo.key,
      fileName: file.originalName,
      signature,
      driveKey: uploadInfo.driveKey
    });
    // public to block chain
    await this.web3Service.uploadFile({
      fileId: newFile.identifiers[0].id,
      uploaderAddress: userInfo.blockChainAddress,
      fileName: file.originalName,
    }, userInfo.userName);

    return uploadInfo.key;
  }

  async getFile(fileId: string, userId: string, requesterPrivateKey: string): Promise<{
    fileBuffer: Buffer,
    mimeType: string,
    signature: string,
    ownerPublicKey: string,
    encryptedKey: string
  }> {
    const myUser = await this.masterConnection.getRepository(User).findOne({
      where: {
        id: userId
      }
    });

    if (!myUser) {
      throw new BusinessException("User not found");
    }

    const requestedFile = await this.masterConnection.getRepository(RequestFile).findOne({
      where: {
        fileId: fileId,
        requesterId: userId,
        isValid: true,
        status: RequestFileStatus.APPROVED
      }
    })

    if (!requestedFile) {
      throw new BusinessException("File not found");
    }

    const fileInfor = await this.masterConnection.getRepository(File).findOne({
      where: {
        id: fileId
      }
    });
    if (!fileInfor) {
      throw new BusinessException("File not found");
    }

    const data =  await this.s3UploadService.getFileStream(fileInfor.driveKey);
    return {
      fileBuffer: data.encryptedBuffer,
      mimeType: data.mimeType,
      signature: fileInfor.signature,
      ownerPublicKey: requestedFile.ownerPublicKey,
      encryptedKey: this.encryptionService.decryptWithPrivateKey(requesterPrivateKey, requestedFile.encryptedKey)
    }
  }
  decryptFile(fileBuffer: Buffer, key: string): Buffer {
    return this.encryptionService.decryptFileSymmetric(fileBuffer, key);
  }
  async requestDownloadFile(fileId: string, userId: string, requesterPublicKey: string): Promise<any> {
    const fileInfor = await this.masterConnection.getRepository(File).findOne({
      where: {
        id: fileId
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
    // send request to block chain
    await this.web3Service.requestAccess(fileId, userInfor.blockChainAddress, userInfor.userName);

    await this.masterConnection.getRepository(RequestFile).insert({
      ownerId: fileInfor.userId,
      requesterId: userId,
      fileId: fileInfor.id,
      isValid: true,
      requesterPublicKey
    })
    return {}
  }

  async acceptRequest(requestFileId: string, userId: string, ownerPublicKey: string): Promise<any> {

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

    const requester = await this.masterConnection.getRepository(User).findOne({
      where: {
        id: requestFile.requesterId
      }
    })

    if (!requester) {
      throw new BusinessException("Requester not found");
    }

    const fileInfor = await this.masterConnection.getRepository(File).findOne({
      where: {
        id: requestFile.fileId
      }
    })


    const encryptedKey =  this.encryptionService.encryptWithPublicKey(requestFile.requesterPublicKey, fileInfor.fileKey);

    if (!encryptedKey) {
      throw new BusinessException("Failed to encrypt the file key");
    }
    await this.masterConnection.getRepository(RequestFile).update({
      id: requestFileId
    }, {
      status: RequestFileStatus.APPROVED,
      ownerPublicKey,
      encryptedKey
    })
    // public to block chain
    await this.web3Service.approveOrRejectAccess(
        requestFile.fileId,
        requester.blockChainAddress,
        true,
        userInfor.blockChainAddress,
        encryptedKey
    );

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

    const requester = await this.masterConnection.getRepository(User).findOne({
      where: {
        id: requestFile.requesterId
      }
    })

    if (!requester) {
      throw new BusinessException("Requester not found");
    }
    await this.masterConnection.getRepository(RequestFile).update({
      id: requestFileId
    }, {
      status: RequestFileStatus.REJECTED
    })

    await this.web3Service.approveOrRejectAccess(
        requestFile.fileId,
        requester.blockChainAddress,
        false,
        userInfor.blockChainAddress,
        ""
    );

    return {}
  }
  async getNewListFile(userId: string): Promise<File[]> {

    const userInfor = await this.masterConnection.getRepository(User).findOne({
      where: {
        id: userId
      }
    });
    if (!userInfor) {
      throw new BusinessException("User not found");
    }
    const requestedFile = await this.masterConnection.getRepository(RequestFile).find({
      where: {
        requesterId: userId
      }
    });
    const requestFile = await this.masterConnection.getRepository(File).find({
      where: {
        userId: Not(Equal(userId)),
        id: Not(In(requestedFile.map(file => file.fileId))),
      }
    })
    const author = await this.masterConnection.getRepository(User).find({
      where: {
        id: In(requestFile.map(file => file.userId))
      }
    })
    return requestFile.map(file => {
      const authorInfor = author.find(user => user.id === file.userId);
      return {
        ...file,
        userName: authorInfor?.userName
      }
    })
  }

  async getNewListRequestedFile(userId: string): Promise<any> {

    const userInfor = await this.masterConnection.getRepository(User).findOne({
      where: {
        id: userId
      }
    });

    if (!userInfor) {
      throw new BusinessException("User not found");
    }
    // join table by typeorm file entity and fileRequest entity with owner file = userId
    const requestFile = await this.masterConnection.getRepository(RequestFile).find({
      where: {
        ownerId: userId
      }
    })
    const file = await this.masterConnection.getRepository(File).find({
      where: {
        id: In(requestFile.map(file => file.fileId))
      }
    });
    const requester = await this.masterConnection.getRepository(User).find({
      where: {
        id: In(requestFile.map(file => file.requesterId))
      }
    })
    return requestFile.map(request => {
      const fileInfor = file.find(file => file.id === request.fileId);
      return {
        ...request,
        fileName: fileInfor?.fileName,
        requesterName: requester.find(user => user.id === request.requesterId)?.userName
      }
    })
  }

  async getAcceptedFiles(userId: string): Promise<any> {

    const userInfor = await this.masterConnection.getRepository(User).findOne({
      where: {
        id: userId
      }
    });

    if (!userInfor) {
      throw new BusinessException("User not found");
    }
    // join table by typeorm file entity and fileRequest entity with owner file = userId
    const requestFile = await this.masterConnection.getRepository(RequestFile).find({
      where: {
        requesterId: userId
      }
    })
    const file = await this.masterConnection.getRepository(File).find({
      where: {
        id: In(requestFile.map(file => file.fileId))
      }
    });
    const owner = await this.masterConnection.getRepository(User).find({
      where: {
        id: In(requestFile.map(file => file.ownerId))
      }
    })
    return requestFile.map(request => {
      const fileInfor = file.find(file => file.id === request.fileId);
      return {
        ...request,
        fileName: fileInfor?.fileName,
        ownerName: owner.find(user => user.id === request.ownerId)?.userName
      }
    })
  }
  async getListMyFile(userId: string): Promise<File[]> {

    const userInfor = await this.masterConnection.getRepository(User).findOne({
      where: {
        id: userId
      }
    });
    if (!userInfor) {
      throw new BusinessException("User not found");
    }

    const data =  await this.masterConnection.getRepository(File).find({
      where: {
        userId: userId
      }
    })

    return data.map(file => {
      return {
        ...file,
        userName: userInfor.userName
      }
    });
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
