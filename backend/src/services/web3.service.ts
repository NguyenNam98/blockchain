import { Injectable } from '@nestjs/common';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import {UploadDTO} from "../modules/upload/upload.dto";

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
            "internalType": "bytes32",
            "name": "fileId",
            "type": "bytes32"
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
            "internalType": "bytes32",
            "name": "fileId",
            "type": "bytes32"
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
            "internalType": "bytes32",
            "name": "fileId",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "fileName",
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
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
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
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
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
            "name": "_fileName",
            "type": "string"
          }
        ],
        "name": "uploadFile",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "_fileId",
            "type": "bytes32"
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
            "internalType": "bytes32",
            "name": "_fileId",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "_requestIndex",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "_approved",
            "type": "bool"
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
            "internalType": "bytes32",
            "name": "_fileId",
            "type": "bytes32"
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
            "internalType": "bytes32",
            "name": "_fileId",
            "type": "bytes32"
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
    ]; // Replace with your contract ABI
    const contractAddress: string = "0xfD098DEb3805A7B0C776bC16cc2b63872898bc65"; // Replace with your contract address

    // Initialize the contract instance
    this.fileRecord = new this.web3.eth.Contract(contractABI, contractAddress);
  }

  // Function to upload a file
  async uploadFile(data: UploadDTO, userName: string): Promise<any> {
    return this.fileRecord.methods.uploadFile(data.fileName, userName).send({
      from: data.uploaderAddress,
      gas: "3000000",
    });
  }

  // Function to request access to a file
  async requestAccess(fileId: string, requesterAddress: string): Promise<void> {
    await this.fileRecord.methods.requestAccess(fileId).send({ from: requesterAddress });
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
    ).send({ from: approveAddress });
  }
  async getAccountByIndex(index: number): Promise<string> {
    return this.web3.eth.getAccounts().then(accounts => accounts[index]);
  }
}
