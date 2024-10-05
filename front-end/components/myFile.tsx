import React from "react";
import { Typography, Box } from "@mui/material";

interface FileItem {
    author: string;
    fileName: string;
    status: number;
    fileId: string;
}

export default function MyFile(props: FileItem) {
    const { author, fileName, fileId } = props;

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
            </Box>
        </>
    );
}
