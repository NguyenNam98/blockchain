// import React from "react";
// import { Button, Typography } from "@mui/material";
// import Box from "@mui/material/Box";
// import axios from "axios";
// import { useCookies } from "react-cookie";
// import {useRouter} from "next/navigation";
//
// interface FileRequest {
//   id: string;
//   status: number; // 1 = Pending, 2 = Approved, 3 = Rejected
//   fileId: string;
//   fileName: string;
//   ownerName: string;
// }
//
// export default function MyRequestFileItem(props: FileRequest) {
//   const {fileName, status, fileId, ownerName } = props;
//   const router = useRouter()
//
//   // Handle file download
//   const handleDownload = async () => {
//     router.push(`/file/${fileId}`);
//   };
//
//   // Render based on status
//   const renderActionButton = () => {
//     switch (status) {
//       case 1:
//         return (
//             <Button
//                 variant="contained"
//                 color="ruby"
//                 disabled
//                 sx={{ height: 40, width: 100, color: "#ffffff", marginRight: "15px" }}
//             >
//               Waiting
//             </Button>
//         );
//       case 2:
//         return (
//             <Button
//                 variant="contained"
//                 color="primary"
//                 sx={{ height: 40, width: 100, color: "#ffffff", marginRight: "15px" }}
//                 onClick={handleDownload}
//             >
//               Download
//             </Button>
//         );
//       case 3:
//         return (
//             <Typography variant="body1" sx={{ color: "red", marginRight: "15px" }}>
//               Rejected
//             </Typography>
//         );
//       default:
//         return null;
//     }
//   };
//
//   return (
//       <Box
//           sx={{
//             backgroundColor: "#ffffff",
//             height: 80,
//             borderRadius: "10px",
//             marginBottom: "10px",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             padding: "10px",
//           }}
//       >
//         <Box>
//           <Typography variant="h6">{fileName}</Typography>
//           <Typography variant="body2">{`Owner: ${ownerName}`}</Typography>
//         </Box>
//         <Box sx={{ display: "flex", alignItems: "center" }}>{renderActionButton()}</Box>
//       </Box>
//   );
// }


import React, { useState } from "react";
import { Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Box } from "@mui/material";
import axios from "axios";
import { useCookies } from "react-cookie";

interface FileRequest {
  id: string;
  status: number; // 1 = Pending, 2 = Approved, 3 = Rejected
  fileId: string;
  fileName: string;
  ownerName: string;
}

export default function MyRequestFileItem(props: FileRequest) {
  const { fileName, status, fileId, ownerName } = props;
  const [open, setOpen] = useState(false); // For managing dialog state
  const [privateKeyFile, setPrivateKeyFile] = useState<File | null>(null); // For managing file input
  const [cookies] = useCookies(["uid"]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPrivateKeyFile(event.target.files[0]);
    }
  };

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName); // Filename you want to save
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirm = async () => {
    if (!privateKeyFile) {
      alert("Please upload the private key file before confirming.");
      return;
    }

    // Handle file upload or any other logic here
    const formData = new FormData();
    formData.append("file", privateKeyFile);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_HOST_API}/api/block-chain/v1/file/download?fileId=${fileId}`, formData, {
        headers: {
          "user-id": cookies.uid,
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob", // Indicate that the response is a file
      });

      if (res.data) {
        // Trigger file download
        downloadFile(res.data, fileName);
        handleClose(); // Close the dialog after download
      } else {
        alert("Failed to download file.");
      }
    } catch (error) {
      console.error("Error during file download:", error);
      alert("Error downloading file.");
    }
  };

  const renderActionButton = () => {
    switch (status) {
      case 1:
        return (
            <Button
                variant="contained"
                color="secondary"
                disabled
                sx={{ height: 40, width: 100, color: "#ffffff", marginRight: "15px" }}
            >
              Waiting
            </Button>
        );
      case 2:
        return (
            <>
              <Button
                  variant="contained"
                  color="primary"
                  sx={{ height: 40, width: 100, color: "#ffffff", marginRight: "15px" }}
                  onClick={handleClickOpen} // Open the dialog
              >
                Download
              </Button>
              {/* Dialog for uploading private key */}
              <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Upload Private Key</DialogTitle>
                <DialogContent>
                  <Typography>Please upload your private key file to proceed with the download:</Typography>
                  <input type="file" accept=".pem, .key" onChange={handleFileChange} />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="secondary">
                    Cancel
                  </Button>
                  <Button
                      variant="contained"
                      color="primary"
                      onClick={handleConfirm}
                      disabled={!privateKeyFile} // Disable confirm button if no file is selected
                  >
                    Confirm
                  </Button>
                </DialogActions>
              </Dialog>
            </>
        );
      case 3:
        return (
            <Typography variant="body1" sx={{ color: "red", marginRight: "15px" }}>
              Rejected
            </Typography>
        );
      default:
        return null;
    }
  };

  return (
      <Box
          sx={{
            backgroundColor: "#ffffff",
            height: 80,
            borderRadius: "10px",
            marginBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
          }}
      >
        <Box>
          <Typography variant="h6">{fileName}</Typography>
          <Typography variant="body2">{`Owner: ${ownerName}`}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>{renderActionButton()}</Box>
      </Box>
  );
}
