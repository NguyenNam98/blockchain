import React, { useState } from "react";
import { Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Box } from "@mui/material";
import { useCookies } from "react-cookie";
import axios from "axios";

interface FileItem {
    author: string;
    fileName: string;
    status: number;
    fileId: string;
}

export default function NewFile(props: FileItem) {
    const { author, fileName, fileId } = props;
    const [cookies] = useCookies(['uid']);
    const [open, setOpen] = useState(false); // state for dialog
    const [publicKeyFile, setPublicKeyFile] = useState<File | null>(null); // state for the public key file

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

    const handleConfirm = async () => {
        if (!publicKeyFile) {
            alert("Please upload the public key file before proceeding.");
            return;
        }

        // Form data to include the public key file
        const formData = new FormData();
        formData.append("file", publicKeyFile);

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_HOST_API}/api/block-chain/v1/file/request-file?fileId=${fileId}`, formData,{
                headers: {
                    "Content-Type": "multipart/form-data",
                    "user-id": cookies.uid,
                },
            });

            if (res.data) {
                alert("Request file success");
                setOpen(false);
            } else {
                alert("Request file failed");
                setOpen(false);
            }

            handleClose(); // Close the dialog after request
        } catch (error) {
            console.error("Error making the request:", error);
            alert("Request failed");
        }
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
                    <Typography variant={"h6"}>{fileName}</Typography>
                    <Typography variant={"h6"}>{`Author:  ${author}`}</Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                    <Button
                        variant={"contained"}
                        color={"secondary"}
                        sx={{
                            height: 40,
                            width: 100,
                            color: "#ffffff",
                            marginRight: "15px",
                        }}
                        onClick={handleClickOpen}
                    >
                        Request
                    </Button>
                </Box>
            </Box>

            {/* Dialog for uploading the public key */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Upload Public Key</DialogTitle>
                <DialogContent>
                    <Typography>Upload your public key file to request:</Typography>
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
                        disabled={!publicKeyFile} // Disable until a file is uploaded
                    >
                        Request
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
