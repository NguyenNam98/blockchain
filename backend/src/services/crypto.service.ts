import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import {  Transform } from 'stream';



interface SignatureResult {
  signature: string;
  hash: string;
}


@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc'; // AES encryption algorithm

  // Generate a random symmetric key and IV
  private generateSymmetricKey() {
    const key = crypto.randomBytes(32); // 256-bit key
    const iv = crypto.randomBytes(16);  // Initialization vector
    return { key, iv };
  }

  // Encrypt the file content symmetrically using AES
  encryptFileSymmetric(fileBuffer: Buffer, keyString: string, ivString: string) {
   const key = Buffer.from(keyString, 'hex')
   const iv = Buffer.from(ivString, 'hex')
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encryptedFile = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);

    return {
      encryptedFile,       // Return encrypted file as Buffer
    };
  }

  // Encrypt the symmetric key asymmetrically using RSA
  encryptSymmetricKeyAsymmetric(publicKey: string, symmetricKeyHex: string) {
    const encryptedKey = crypto.publicEncrypt(publicKey, Buffer.from(symmetricKeyHex, 'hex')); // Encrypt symmetric key
    return encryptedKey.toString('base64'); // Return encrypted key in base64 format
  }

  // Decrypt the symmetric key using RSA private key
  decryptSymmetricKeyAsymmetric(privateKey: string, encryptedKeyBase64: string) {
    const decryptedKey = crypto.privateDecrypt(privateKey, Buffer.from(encryptedKeyBase64, 'base64'));
    return decryptedKey.toString('hex'); // Return symmetric key in hex format
  }

  // Decrypt the file symmetrically using AES
  decryptFileSymmetric(keyHex: string, ivHex: string) {
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

    return new Transform({
      transform(chunk, encoding, callback) {
        try {
          // Decrypt each chunk and pass it on
          const decryptedChunk = decipher.update(chunk);
          callback(null, decryptedChunk);
        } catch (err) {
          callback(err);
        }
      },
      flush(callback) {
        try {
          // Finalize decryption process
          const finalChunk = decipher.final();
          callback(null, finalChunk);
        } catch (err) {
          callback(err);
        }
      },
    });
  }

   async signFileStream(fileStream: NodeJS.ReadableStream, privateKey: string): Promise<SignatureResult> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256'); // Hashing algorithm (SHA-256)
      const sign = crypto.createSign('sha256'); // Signature algorithm (using SHA-256)

      fileStream.on('data', (chunk) => {
        hash.update(chunk);      // Update the hash with file data
        sign.update(chunk);      // Update the signature with file data
      });
      const privateKeyBase64 = Buffer.from(privateKey, 'base64');

      fileStream.on('end', () => {
        try {
          // Generate the final hash and signature
          const finalHash = hash.digest('hex');
          const finalSignature = sign.sign({ key: privateKeyBase64, format: 'der', type: 'pkcs8' }, 'base64'); // Sign the hash with the private key

          resolve({
            hash: finalHash,
            signature: finalSignature,
          });
        } catch (err) {
          reject(err);
        }
      });

      fileStream.on('error', (err) => {
        reject(err);
      });
    });
  }
  async verifySignature(
      fileStream: NodeJS.ReadableStream,
      signature: string,
      publicKey: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const verify = crypto.createVerify('sha256');

      // Convert the Base64 DER public key back to a Buffer
      const publicKeyBase64 = Buffer.from(publicKey, 'base64');

      fileStream.on('data', (chunk) => {
        hash.update(chunk);      // Update the hash with file data
        verify.update(chunk);    // Update the verification process with file data
      });

      fileStream.on('end', () => {
        try {
          const isVerified = verify.verify({ key: publicKeyBase64, format: 'der', type: 'spki' }, signature, 'base64');
          resolve(isVerified);   // Resolve whether the signature is valid
        } catch (err) {
          reject(err);           // Reject the promise on error
        }
      });

      fileStream.on('error', (err) => {
        reject(err);
      });
    });
  }
}
