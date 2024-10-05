import { Injectable } from '@nestjs/common';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';


@Injectable()
export class Web3Service {
  private web3: Web3;
  private fileRecord: Contract<any>;

  constructor() {
    // Initialize Web3 with the local or remote provider (Ganache or Infura)
    this.web3 = new Web3('http://127.0.0.1:7545'); // Replace with your provider

    // ABI and contract address for the deployed contract
    const contractABI: any[] = [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "string",
            "name": "fileId",
            "type": "string"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "requester",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "approvalTimestamp",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "fileHash",
            "type": "string"
          }
        ],
        "name": "AccessApproved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "string",
            "name": "fileId",
            "type": "string"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "requester",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "name": "AccessRequested",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "string",
            "name": "fileId",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "fileName",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "userName",
            "type": "string"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "uploader",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "name": "FileUploaded",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "accessRequests",
        "outputs": [
          {
            "internalType": "address",
            "name": "requester",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "approvalTimestamp",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "name": "files",
        "outputs": [
          {
            "internalType": "string",
            "name": "fileName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "userName",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "uploader",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "fileId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_fileName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "userName",
            "type": "string"
          }
        ],
        "name": "uploadFile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_fileId",
            "type": "string"
          }
        ],
        "name": "requestAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_fileId",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "_requester",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "_approved",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "_hash",
            "type": "string"
          }
        ],
        "name": "approveAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_fileId",
            "type": "string"
          }
        ],
        "name": "getAccessRequestsCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_fileId",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "_index",
            "type": "uint256"
          }
        ],
        "name": "getAccessRequest",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      }
    ]
    const contractAddress: string = process.env.CONTRACT_ADDRESS; // Replace with your contract address

    // Initialize the contract instance
    this.fileRecord = new this.web3.eth.Contract(contractABI, contractAddress);
  }

  // Function to upload a file
  async uploadFile(data: {
    fileId: string,
    uploaderAddress: string,
    fileName: string
  }, userName: string): Promise<any> {
    return this.fileRecord.methods.uploadFile(
        data.fileId,
        data.fileName,
        userName
    ).send({
      from: data.uploaderAddress,
      gas: "3000000",
    });
  }

  // Function to request access to a file
  async requestAccess(fileId: string, requesterAddress: string): Promise<void> {
    await this.fileRecord.methods.requestAccess(fileId).send({ from: requesterAddress, gas: "3000000", });
  }

  // Function to approve access to a file
  async approveOrRejectAccess(
      fileId: string,
      requesterAddress: string,
      isAccept: boolean,
      approveAddress: string,
      encryptedKey: string,
  ): Promise<void> {
    await this.fileRecord.methods.approveAccess(
        fileId,
        requesterAddress,
        isAccept,
        encryptedKey
    ).send({ from: approveAddress, gas: "3000000", });
  }
  async getAccountByIndex(index: number): Promise<string> {
    return this.web3.eth.getAccounts().then(accounts => accounts[index]);
  }
}
