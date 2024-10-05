import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ProfileKeyService {
  // Generate an RSA key pair as raw strings (non-PEM)

  generateSymmetricKey() {
    const symmetricKey = crypto.randomBytes(32); // 256-bit symmetric key
    const iv = crypto.randomBytes(16);           // Initialization vector (IV)

    // Return the generated symmetric key and IV in hex format to store in the database
    return {
      symmetricKey: symmetricKey.toString('hex'),
      iv: iv.toString('hex'),
    };
  }
  // generateKeyPair() {
  //   const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  //     modulusLength: 2048, // Key size in bits
  //     publicKeyEncoding: {
  //       type: 'spki',   // Standard for public keys
  //       format: 'der'   // DER format (raw binary format)
  //     },
  //     privateKeyEncoding: {
  //       type: 'pkcs8',  // Standard for private keys
  //       format: 'der'   // DER format (raw binary format)
  //     }
  //   });
  //
  //   // Convert keys to Base64 for easy transmission/storage
  //   const publicKeyBase64 = publicKey.toString('base64');
  //   const privateKeyBase64 = privateKey.toString('base64');
  //
  //   return {
  //     publicKey: publicKeyBase64,
  //     privateKey: privateKeyBase64,
  //   };
  // }
  generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048, // Key size in bits
      publicKeyEncoding: {
        type: 'spki',  // Standard for public keys
        format: 'pem', // PEM format (text format)
      },
      privateKeyEncoding: {
        type: 'pkcs8', // Standard for private keys
        format: 'pem', // PEM format (text format)
      }
    });

    return {
      publicKey,  // PEM-formatted public key
      privateKey, // PEM-formatted private key
    };
  }

}
