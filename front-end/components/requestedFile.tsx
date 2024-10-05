import React, { useState } from "react";
import { Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Box } from "@mui/material";
import { useCookies } from "react-cookie";
import axios from "axios";

interface FileItem {
  author: string;
  fileName: string;
  status: number; // 1 = Pending, 2 = Accepted, 3 = Rejected
  fileId: string;
  id: string;
}

export default function RequestedItem(props: FileItem) {
  let { author, fileName, status, fileId, id } = props;
  const [statusRequest, setStatusRequest] = useState(status);
  const [open, setOpen] = useState(false); // For managing dialog state
  const [publicKeyFile, setPublicKeyFile] = useState<File | null>(null); // For managing file input
  const [cookies] = useCookies(["uid"]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPublicKeyFile(event.target.files[0]);
    }
  };

  const confirmFileRequest = async () => {
    if (!publicKeyFile) {
      alert("Please upload the public key file before confirming.");
      return;
    }

    // Handle file upload or any other logic here
    const formData = new FormData();
    formData.append("file", publicKeyFile);

    try {
      const res = await axios.post(
          `${process.env.NEXT_PUBLIC_HOST_API}/api/block-chain/v1/file/accept-request?requestId=${id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "user-id": cookies.uid,
            },
          }
      );
      if (res.data) {
        alert(`Accepted successfully`);
        setStatusRequest(2); // Set status to accepted
        handleClose(); // Close dialog
      }
    } catch (error) {
      alert(`Accepted failed`);
      console.error("Error processing request:", error);
    }
  };

  const rejectFileRequest = async () => {
    try {
      const res = await axios.get(
          `${process.env.NEXT_PUBLIC_HOST_API}/api/block-chain/v1/file/reject-request?requestId=${id}`,
          {
            headers: {
              "user-id": cookies.uid,
            },
          }
      );
      if (res.data) {
        alert(`Request reject-request processed successfully`);
        setStatusRequest(3); // Set status to rejected
      }
    } catch (error) {
      console.error("Error processing request:", error);
    }
  };

  const renderStatusButtons = () => {
    if (statusRequest === 1) {
      return (
          <>
            <Button
                variant="contained"
                color="success"
                sx={{ height: 40, width: 100, color: "#ffffff", marginRight: "10px" }}
                onClick={handleClickOpen} // Opens the dialog
            >
              Accept
            </Button>
            <Button
                variant="contained"
                color="error"
                sx={{ height: 40, width: 100, color: "#ffffff", marginRight: "15px" }}
                onClick={() => rejectFileRequest()}
            >
              Reject
            </Button>
          </>
      );
    } else if (statusRequest === 2) {
      return (
          <Typography
              variant="body1"
              sx={{ color: "green", marginRight: "15px", fontWeight: "bold" }}
          >
            Accepted
          </Typography>
      );
    } else if (statusRequest === 3) {
      return (
          <Typography
              variant="body1"
              sx={{ color: "red", marginRight: "15px", fontWeight: "bold" }}
          >
            Rejected
          </Typography>
      );
    }
    return null;
  };

  return (
      <>
        <Box
            sx={{
              backgroundColor: "#ffffff",
              height: 80,
              borderRadius: "10px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
        >
          <Box
              sx={{
                marginLeft: "15px",
                padding: "10px",
              }}
          >
            <Typography variant="h6">{fileName}</Typography>
            <Typography variant="h6">{`Requester: ${author}`}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {renderStatusButtons()}
          </Box>
        </Box>

        {/* Dialog for uploading public key */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Upload Public Key</DialogTitle>
          <DialogContent>
            <Typography>Please upload your public key file to confirm the request:</Typography>
            <input type="file" accept=".pem, .key" onChange={handleFileChange} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button
                variant="contained"
                color="primary"
                onClick={confirmFileRequest}
                disabled={!publicKeyFile} // Disable confirm button if no file is selected
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </>
  );
}
