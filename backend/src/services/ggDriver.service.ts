import { Injectable, Logger } from "@nestjs/common";
import { google, drive_v3 } from "googleapis";
import * as fs from "fs";
import * as moment from "moment";
import { v4 as uuidv4 } from "uuid";
import {EncryptionService} from "./crypto.service";
import {promisify} from "util";
import { Readable } from 'stream';

interface IUploadResult {
  url: string;
  key: string;
  driveKey: string;
}

export type TFile = {
  filePath: string;
  originalName: string;
  mimeType: string;
};

interface DecryptOptions {
  key: string; // Symmetric key in hex format
  iv: string;  // Initialization vector in hex format
  privateKey: string
}

const readFileAsync = promisify(fs.readFile); // Promisified version of fs.readFile


@Injectable()
export class GoogleDriveService {
  private readonly driveClient: drive_v3.Drive;
  private readonly logger = new Logger(GoogleDriveService.name);

  constructor(
      private readonly encryptionService: EncryptionService
  ) {
    const auth = new google.auth.GoogleAuth({
      keyFile: "./src/credentials/gcloud.json",
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    this.driveClient = google.drive({ version: 'v3', auth });
  }

  private generateFileName(fileName: string): string {
    return `${uuidv4()}-${moment().format(
        "YYYYMMDDHHmmssSS"
    )}-${fileName.replace(/[^a-zA-Z0-9/!_.*'()]/g, "-")}`;
  }
  private bufferToStream(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // Signals the end of the stream
    return stream;
  }
  async uploadFile(file: TFile): Promise<IUploadResult> {
    try {
      Logger.log("Starting upload file to Driver signing file", file.originalName)
      const fileName = this.generateFileName(file.originalName);
      const fileBuffer = await readFileAsync(file.filePath);

      const { encryptedFile, key } = this.encryptionService.encryptFileSymmetric(
          fileBuffer
      );
     Logger.log("+++++++++++++++++Encrypted file to Driver signing file++++++++++++++++++++++++=")
     Logger.log(encryptedFile)
      const fileMetadata: drive_v3.Schema$File = {
        name: fileName,
      };

      const media = {
        mimeType: file.mimeType, // Keep the original mimeType or set a specific type for encrypted files
        body: this.bufferToStream(encryptedFile), // Use the encrypted file stream
      };


      const response = await this.driveClient.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      });
      this.logger.log(`Uploaded file to Google Drive: ${fileName}`);
      await this.driveClient.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',  // Access level (e.g., 'reader' for view-only access)
          type: 'anyone',  // 'anyone' means public access
        },
      });

      this.logger.log(`Uploaded file to ID ++++++++++++: ${response.data.id}`);


      return {
        url: response.data.webViewLink || '',
        key: key,
        driveKey: response.data.id
      };
    } catch (error) {
      this.logger.error(`Error uploading file to Google Drive: ${error}`);
      throw error;
    }
  }

  async getFileStream(fileId: string): Promise<{
    encryptedBuffer: Buffer,
    mimeType: string

  }> {
    try {
      Logger.log("Starting fetch file stream from Driver signing file", fileId)
      // First, fetch the file metadata to get the mimeType
      const fileMetadata = await this.driveClient.files.get({
        fileId: fileId,
        fields: 'mimeType',
      });

      const mimeType = fileMetadata.data.mimeType;

      // const response = await this.driveClient.files.get(
      //     { fileId: fileId, alt: 'media' },
      //     { responseType: 'stream' }
      // );
      const response = await this.driveClient.files.get(
          { fileId: fileId, alt: 'media' },
          { responseType: 'arraybuffer' }
      );
      // const encryptedStream = response.data;
      const encryptedBuffer = Buffer.from(response.data as any);

      Logger.log("Finish fetch file stream from Driver signing file", fileId)
      // const { hash, signature } = await this.encryptionService.signFileBuffer(encryptedBuffer, decryptOptions.privateKey);
      return {
        encryptedBuffer,
        mimeType
      }
    } catch (error) {
      this.logger.error(`Error fetching file stream from Google Drive: ${error}`);
      throw error;
    }
  }

}
