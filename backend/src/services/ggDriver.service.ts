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
  additionalData?: any;
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
  async uploadFile(file: TFile, userKey: {
    keyString: string,
    ivString: string,
  }): Promise<IUploadResult> {
    try {
      const fileName = this.generateFileName(file.originalName);
      const fileBuffer = await readFileAsync(file.filePath);

      const { encryptedFile } = this.encryptionService.encryptFileSymmetric(
          fileBuffer,
          userKey.keyString,
          userKey.ivString
      );

      const fileMetadata: drive_v3.Schema$File = {
        name: fileName,
      };

      const media = {
        mimeType: file.mimeType, // Keep the original mimeType or set a specific type for encrypted files
        body: this.bufferToStream(encryptedFile), // Use the encrypted file stream
      };

      this.logger.log(`Uploading file to Google Drive: ${fileName}`);

      const response = await this.driveClient.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      });

      return {
        url: response.data.webViewLink || '',
        key: response.data.id || '',
      };
    } catch (error) {
      this.logger.error(`Error uploading file to Google Drive: ${error}`);
      throw error;
    }
  }

  async getFileStream(fileId: string, decryptOptions: DecryptOptions): Promise<{
    stream: NodeJS.ReadableStream,
    mineType: string,
    signature: string,
    hash: string
  }> {
    try {
      // First, fetch the file metadata to get the mimeType
      const fileMetadata = await this.driveClient.files.get({
        fileId: fileId,
        fields: 'mimeType',
      });

      const mimeType = fileMetadata.data.mimeType;

      console.log("mimeType", mimeType)

      const response = await this.driveClient.files.get(
          { fileId: fileId, alt: 'media' },
          { responseType: 'stream' }
      );
      const encryptedStream = response.data;

      // const { hash, signature } = await this.encryptionService.signFileStream(encryptedStream, decryptOptions.privateKey);
      // Step 3: Create a decryption stream using the provided key and IV
      const decryptionStream = this.encryptionService.decryptFileSymmetric(decryptOptions.key, decryptOptions.iv);

      // Step 4: Pipe the encrypted stream through the decryption stream
      const decryptedStream = encryptedStream.pipe(decryptionStream);
      return {
        stream: decryptedStream,  // Return the original file stream (encrypted, in your case)
        signature: "asss",   // Signature of the file
        hash: "asss",             // Hash of the file
        mineType: mimeType,
      };
    } catch (error) {
      this.logger.error(`Error fetching file stream from Google Drive: ${error}`);
      throw error;
    }
  }
}
