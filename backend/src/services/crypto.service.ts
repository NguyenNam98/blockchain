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

  // Encrypt the file content symmetrically using AES
  encryptFileSymmetric(fileBuffer: Buffer) {
    const keyString = process.env.SYMMETRIC_KEY;
    const ivString = process.env.IV_KEY;
    const key = Buffer.from(keyString, 'hex')
    const iv = Buffer.from(ivString, 'hex')
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encryptedFile = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);

    return {
      encryptedFile,       // Return encrypted file as Buffer
    };
  }
  decryptFileSymmetric(encryptedBuffer: Buffer) {
    const keyString = process.env.SYMMETRIC_KEY;
    const ivString = process.env.IV_KEY;
    const key = Buffer.from(keyString, 'hex');
    const iv = Buffer.from(ivString, 'hex');

    // Create a decipher object with the same algorithm, key, and IV used for encryption
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

    // Decrypt the file
    const decryptedFile = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

    return decryptedFile; // Return the decrypted file as Buffer
  }
  // Encrypt the symmetric key asymmetrically using RSA
  // encryptSymmetricKeyAsymmetric(publicKey: string, symmetricKeyHex: string) {
  //   console.log("publicKey", publicKey)
  //   const encryptedKey = crypto.publicEncrypt(publicKey, Buffer.from(symmetricKeyHex, 'hex')); // Encrypt symmetric key
  //   return encryptedKey.toString('base64'); // Return encrypted key in base64 format
  // }
  //
  // // Decrypt the symmetric key using RSA private key
  // decryptSymmetricKeyAsymmetric(privateKey: string, encryptedKeyBase64: string) {
  //   const decryptedKey = crypto.privateDecrypt(privateKey, Buffer.from(encryptedKeyBase64, 'base64'));
  //   return decryptedKey.toString('hex'); // Return symmetric key in hex format
  // }
  // encryptSymmetricKeyAsymmetric(publicKeyBase64: string, symmetricKeyHex: string): string {
  //   // Convert the Base64-encoded public key back to a Buffer (DER format)
  //   const publicKey = Buffer.from(publicKeyBase64, 'base64');
  //
  //   // Encrypt the symmetric key using the public key
  //   const encryptedKey = crypto.publicEncrypt(
  //       publicKey, // Public key in Buffer form (DER format)
  //       Buffer.from(symmetricKeyHex, 'hex') // Symmetric key in hex format converted to Buffer
  //   );
  //
  //   // Return the encrypted key as a Base64-encoded string
  //   return encryptedKey.toString('base64');
  // }
  // encryptSymmetricKeyAsymmetric(publicKeyPem: string, symmetricKeyHex: string): string {
  //   const encryptedKey = crypto.publicEncrypt(
  //       publicKeyPem, // Public key in PEM format
  //       Buffer.from(symmetricKeyHex, 'hex') // Symmetric key in hex format converted to Buffer
  //   );
  //
  //   return encryptedKey.toString('base64'); // Return encrypted key in Base64 format
  // }

  // Decrypt the symmetric key using the private key (in PEM format)
  // decryptSymmetricKeyAsymmetric(privateKeyPem: string, encryptedKeyBase64: string): string {
  //   const decryptedKey = crypto.privateDecrypt(
  //       privateKeyPem, // Private key in PEM format
  //       Buffer.from(encryptedKeyBase64, 'base64') // Encrypted key in Base64 format converted to Buffer
  //   );
  //
  //   return decryptedKey.toString('hex'); // Return decrypted symmetric key in hex format
  // }


  async signFileBuffer(fileBuffer: Buffer, privateKey: string): Promise<SignatureResult> {
    return new Promise((resolve, reject) => {
      try {
        const hash = crypto.createHash('sha256');  // Hashing algorithm (SHA-256)
        const sign = crypto.createSign('sha256');  // Signature algorithm (using SHA-256)

        // Update both hash and signature with the file buffer
        hash.update(fileBuffer);
        sign.update(fileBuffer);

        // Convert private key from Base64 to Buffer
        const privateKeyBuffer = Buffer.from(privateKey, 'base64');

        // Generate the final hash and signature
        const finalHash = hash.digest('hex');  // Finalize the hash
        const finalSignature = sign.sign({ key: privateKeyBuffer, format: 'der', type: 'pkcs8' }, 'base64');  // Sign the hash with the private key

        resolve({
          hash: finalHash,          // Return the final hash
          signature: finalSignature // Return the base64-encoded signature
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}



