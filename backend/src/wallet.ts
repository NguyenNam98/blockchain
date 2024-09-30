import * as crypto from 'crypto';

export class Wallet {
  public publicKey: string;
  private privateKey: string;

  constructor() {
    const { publicKey, privateKey } = this.generateKeys();
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  private generateKeys() {
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return {
      publicKey: keyPair.publicKey.toString(),
      privateKey: keyPair.privateKey.toString(),
    };
  }

  signTransaction(data: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(data).end();
    return sign.sign(this.privateKey, 'hex');
  }

  verifySignature(data: string, signature: string): boolean {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    return verify.verify(this.publicKey, signature, 'hex');
  }
}
