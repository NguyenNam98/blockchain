import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import * as crypto from 'crypto';
import {  Transform } from 'stream';
import {createSign, createVerify} from "crypto";
import fs from "fs";



interface SignatureResult {
  signature: string;
  hash: string;
}


@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc'; // AES encryption algorithm

  // Encrypt the file content symmetrically using AES
  encryptFileSymmetric(fileBuffer: Buffer): {
    encryptedFile: Buffer;
    key: string;
  } {
    Logger.log("Starting encrypt file")
    const key = crypto.randomBytes(32); // Generate a 256-bit key (32 bytes)
    const ivString = process.env.IV_KEY;
    const iv = Buffer.from(ivString, 'hex')
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encryptedFile = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
    Logger.log("Finish encrypt file")

    return {
      encryptedFile,
      key: key.toString('hex')// Return encrypted file as Buffer
    };
  }
  decryptFileSymmetric(encryptedBuffer: Buffer, keyString: string) {
    const ivString = process.env.IV_KEY;
    const key = Buffer.from(keyString, 'hex');
    const iv = Buffer.from(ivString, 'hex');

    // Create a decipher object with the same algorithm, key, and IV used for encryption
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

    // Decrypt the file
    const decryptedFile = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

    return decryptedFile; // Return the decrypted file as Buffer
  }


  async signFileBuffer(fileBuffer: Buffer, privateKey: string): Promise<string> {
    const sign = createSign('sha256');
    sign.update(fileBuffer);
    sign.end();
    let signature = ""

    try {
      // Sign the file with the private key
      signature = sign.sign(privateKey, 'hex');
    } catch (error) {
      throw new BadRequestException('Failed to sign the file');
    }
    return signature
  }
  async verifyFileBuffer(
      fileBuffer: Buffer,
      publicKey: string,
      signature: string
  ): Promise<boolean> {
    const verify = createVerify('sha256');
    verify.update(fileBuffer); // Use the file from the buffer (server-side file)
    verify.end();

    let isValid = false;

    try {
      // Verify the signature using the provided public key
      isValid = verify.verify(publicKey, signature, 'hex');

    } catch (error) {
      throw new BadRequestException('Failed to verify the file');
    }
    return isValid;
  }
  encryptWithPublicKey(publicKeyPem: string, symmetricKey: string): string {
    Logger.log("Starting encrypt with public key")
    const encryptedSymmetricKey = crypto.publicEncrypt(
        publicKeyPem, // Public key in PEM format
        Buffer.from(symmetricKey, 'utf8')
    );

    Logger.log("Finish encrypt with public key")
    return encryptedSymmetricKey.toString('base64');
  }

  // Decrypt the encrypted symmetric key using the private key (PEM format)
  decryptWithPrivateKey(privateKeyPem: string, encryptedSymmetricKeyBase64: string): string {
    Logger.log("+++++++++++++++=Encrypted Key ++++++++++++++")
    Logger.log(encryptedSymmetricKeyBase64)
    const decryptedSymmetricKey = crypto.privateDecrypt(
        privateKeyPem,
        Buffer.from(encryptedSymmetricKeyBase64, 'base64') // Convert Base64-encoded encrypted key to Buffer
    );
    return decryptedSymmetricKey.toString('utf8');
  }
}



