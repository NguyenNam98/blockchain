// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

contract StoreFile {
//    uint value;
//
//    function set(uint v) public{
//        value = v;
//    }
//
//    function get() public view returns(uint){
//        return value;
//    }
    // Struct to represent a file upload
    struct File {
        string fileName;
        address uploader;
        uint256 timestamp;
    }

    // Struct to represent an access request
    struct AccessRequest {
        address requester;
        uint256 timestamp;
        bool approved;
        uint256 approvalTimestamp;
    }

    // Mapping from file ID to File struct
    mapping(bytes32 => File) public files;

    // Mapping from file ID to array of access requests
    mapping(bytes32 => AccessRequest[]) public accessRequests;

    // Event emitted when a new file is uploaded
    event FileUploaded(bytes32 indexed fileId, string fileName, address indexed uploader, uint256 timestamp);

    // Event emitted when an access request is made
    event AccessRequested(bytes32 indexed fileId, address indexed requester, uint256 timestamp);

    // Event emitted when an access request is approved or denied
    event AccessApproved(bytes32 indexed fileId, address indexed requester, uint256 approvalTimestamp, bool approved);

    // Function to upload a new file record
    function uploadFile(string memory _fileName) public returns (bytes32) {
        require(bytes(_fileName).length > 0, "File name cannot be empty");

        bytes32 fileId = keccak256(abi.encodePacked(_fileName, msg.sender, block.timestamp));
        files[fileId] = File({
            fileName: _fileName,
            uploader: msg.sender,
            timestamp: block.timestamp
        });

        emit FileUploaded(fileId, _fileName, msg.sender, block.timestamp);
        return fileId;
    }

    // Function to request access to a file
    function requestAccess(bytes32 _fileId) public {
        require(files[_fileId].uploader != address(0), "File does not exist");

        accessRequests[_fileId].push(AccessRequest({
            requester: msg.sender,
            timestamp: block.timestamp,
            approved: false,
            approvalTimestamp: 0
        }));

        emit AccessRequested(_fileId, msg.sender, block.timestamp);
    }

    // Function for the file owner to approve or deny an access request
    function approveAccess(bytes32 _fileId, uint256 _requestIndex, bool _approved) public {
        require(files[_fileId].uploader == msg.sender, "Only uploader can approve access");
        require(_requestIndex < accessRequests[_fileId].length, "Invalid access request index");

        AccessRequest storage request = accessRequests[_fileId][_requestIndex];
        require(!request.approved, "Request already processed");

        request.approved = _approved;
        request.approvalTimestamp = block.timestamp;

        emit AccessApproved(_fileId, request.requester, block.timestamp, _approved);
    }

    // Function to get the number of access requests for a file
    function getAccessRequestsCount(bytes32 _fileId) public view returns (uint256) {
        return accessRequests[_fileId].length;
    }

    // Function to get details of a specific access request
    function getAccessRequest(bytes32 _fileId, uint256 _index) public view returns (address, uint256, bool, uint256) {
        require(_index < accessRequests[_fileId].length, "Invalid access request index");

        AccessRequest memory request = accessRequests[_fileId][_index];
        return (request.requester, request.timestamp, request.approved, request.approvalTimestamp);
    }
}