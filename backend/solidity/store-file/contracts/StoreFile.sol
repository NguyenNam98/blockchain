// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

contract StoreFile {
    struct File {
        string fileName;
        string userName;
        address uploader;
        uint256 timestamp;
    }

    // Struct to represent an access request
    struct AccessRequest {
        address requester;
        uint256 timestamp;
        bool approved;
        uint256 approvalTimestamp;
        string requestUserName;
    }

    // Mapping from file ID (string) to File struct
    mapping(string => File) public files;

    // Mapping from file ID (string) to array of access requests
    mapping(string => AccessRequest[]) public accessRequests;

    // Event emitted when a new file is uploaded
    event FileUploaded(
        string indexed fileId,
        string fileName,
        string userName,
        address indexed uploader,
        uint256 timestamp
    );

    // Event emitted when an access request is made
    event AccessRequested(
        string indexed fileId,
        address indexed requester,
        uint256 timestamp,
        string requestUserName
    );

    // Event emitted when an access request is approved or denied, including the file hash
    event AccessApprovedOrRejected(
        string indexed fileId,
        address indexed requester,
        uint256 approvalTimestamp,
        bool approved,
        string fileHash,
        string emailMessage

    );

    // Function to upload a new file record with a provided fileId
    function uploadFile(
        string memory fileId,
        string memory _fileName,
        string memory userName
    ) public {
        files[fileId] = File({
            fileName: _fileName,
            uploader: msg.sender,
            timestamp: block.timestamp,
            userName: userName
        });

        // Emit the event with all details for transparency
        emit FileUploaded(fileId, _fileName, userName, msg.sender, block.timestamp);
    }

    // Function to request access to a file
    function requestAccess(
        string memory _fileId,
        string memory userName
    ) public {
        require(files[_fileId].uploader != address(0), "File does not exist");

        // Check if the user has already requested access
        AccessRequest[] storage requests = accessRequests[_fileId];
        for (uint256 i = 0; i < requests.length; i++) {
            AccessRequest storage existingRequest = requests[i];

            // If the requester already exists, check the status of their request
            if (existingRequest.requester == msg.sender) {
                require(!existingRequest.approved, "Access already granted");
                require(existingRequest.approvalTimestamp == 0, "Access already rejected");
                revert("Access request already made, pending approval or rejection");
            }
        }

        accessRequests[_fileId].push(AccessRequest({
            requester: msg.sender,
            timestamp: block.timestamp,
            approved: false,
            approvalTimestamp: 0,
            requestUserName: userName
        }));

        // Emit the event for transparency
        emit AccessRequested(_fileId, msg.sender, block.timestamp, userName);
    }

    // Function for the owner to approve or deny access and log a hash
    function approveAccess(string memory _fileId, address _requester, bool _approved, string memory _hash) public {
        require(files[_fileId].uploader == msg.sender, "Only uploader can approve access");

        AccessRequest[] storage requests = accessRequests[_fileId];

        // Find the request made by the requester
        for (uint256 i = 0; i < requests.length; i++) {
            if (requests[i].requester == _requester) {
                require(!requests[i].approved, "Request already processed");

                requests[i].approved = _approved;
                requests[i].approvalTimestamp = block.timestamp;

                string memory emailMessage = _approved
                    ? "Access approved for your requested file."
                    : "Access request rejected for your requested file.";
                // Emit event with the file hash and approval details for transparency
                emit AccessApprovedOrRejected(
                    _fileId,
                    _requester,
                    block.timestamp,
                    _approved,
                    _hash,
                    emailMessage
                );
                return; // Exit the function after finding and processing the request
            }
        }

        revert("Access request not found");
    }

    // Function to get the number of access requests for a file
    function getAccessRequestsCount(string memory _fileId) public view returns (uint256) {
        return accessRequests[_fileId].length;
    }

    // Function to get details of a specific access request
    function getAccessRequest(string memory _fileId, uint256 _index) public view returns (address, uint256, bool, uint256) {
        require(_index < accessRequests[_fileId].length, "Invalid access request index");

        AccessRequest memory request = accessRequests[_fileId][_index];
        return (request.requester, request.timestamp, request.approved, request.approvalTimestamp);
    }
}
