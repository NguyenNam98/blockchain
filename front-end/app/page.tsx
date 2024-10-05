'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import { Tab, Tabs, Typography, Button, Dialog, DialogContent, DialogTitle, DialogActions } from "@mui/material";
import dynamic from 'next/dynamic'
import TabPanel from "@/components/tabPanel";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import axios from "axios";
import RequestedItem from "@/components/requestedFile";
import MyRequestFileItem from "@/components/myRequested";
import MyFile from "@/components/myFile";

const NewFileItem = dynamic(() => import('@/components/newFile'), { ssr: false });

interface quizzType {
  id: string
  title: string
  description: string
}
interface TFile {
  id: string
  fileName: string
  userName: string
  key: string
}
interface FileRequest {
  id: string; // UUID format
  isValid: boolean;
  ownerId: string; // UUID format
  requesterId: string; // UUID format
  status: number; // 1 = Pending, 2 = Approved, 3 = Rejected
  fileId: string; // UUID format
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  fileName: string;
  requesterName: string;
}

interface FileOtherAccepted {
  id: string; // UUID format
  isValid: boolean;
  ownerId: string; // UUID format
  requesterId: string; // UUID format
  status: number; // 1 = Pending, 2 = Approved, 3 = Rejected
  fileId: string; // UUID format
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  fileName: string;
  ownerName: string;
}

export default function HomePage() {
  const [value, setValue] = useState(1);
  const [cookies, setCookie, removeCookie] = useCookies(['uid']);
  const [newFiles, setNewFiles] = useState<TFile[]>([]);
  const [requestedFiles, setRequestedFiles] = useState<FileRequest[]>([]);
  const [fileOtherAccepted, setFileOtherAccepted] = useState<FileOtherAccepted[]>([]);
  const [myFile, setMyFile] = useState<TFile[]>([]);
  const router = useRouter();


  const [open, setOpen] = useState(false); // state to manage the dialog
  const [selectedFile, setSelectedFile] = useState(null); // state for the main file
  const [keyFile, setKeyFile] = useState(null); // state for the key file

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  const handleKeyFileChange = (event: any) => {
    setKeyFile(event.target.files[0]);
  };
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0] as any);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFile && keyFile) {
      const formData = new FormData();
      formData.append("files", selectedFile);
      formData.append("files", keyFile);

      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_HOST_API}/api/block-chain/v1/file`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "user-id": cookies.uid          }
        });
        if (!res.data.error) {
          alert("File uploaded successfully");
          await getDataFiles()
          setOpen(false);
          setSelectedFile(null);
        }
        console.log("File uploaded successfully:", res.data);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };
  const getDataFiles = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_HOST_API}/api/block-chain/v1/file/list`, {
        headers: {
          "user-id": cookies.uid
        }
      });
      if (res.data) {
        setNewFiles(res.data.newFiles);
        setMyFile(res.data.myFiles);
        setRequestedFiles(res.data.requestedMyFile);
        setFileOtherAccepted(res.data.acceptedMyRequest);
      } else {
        // router.push('/login')
      }
    } catch (e) {
      removeCookie('uid');
      router.push('/login');
    }
  };

  useEffect(() => {
    if (!cookies.uid) {
      router.push('/login');
    } else {
      getDataFiles();
    }
  }, []);

  return (
      <Box sx={{
        display: 'flex',
        height: '100vh',
        paddingTop: '30px',
        backgroundColor: '#f0f0f0',
        flexDirection: 'column',
        color: '#333333'
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
        }}>
          <Typography variant={'h2'}>Share document</Typography>
        </Box>
        <Box sx={{
          position: 'absolute',
          top: '20vh',
          left: '30vh',
          marginTop: '20px',
          width: '70% ',
          maxHeight: '50vh',
        }}>
          <Box sx={{ width: '100%' }}>
            <Tabs
                value={value}
                onChange={handleChange}
                textColor="secondary"
                indicatorColor="secondary"
                aria-label="secondary tabs example"
                sx={{
                  marginLeft: '30%'
                }}
            >
              <Tab value={1} label="New Doccuments" />
              <Tab value={2} label="My Files" />
              <Tab value={3} label="My requested" />
              <Tab value={4} label="Requested Your File" />
            </Tabs>

            {/* Tab Panel for New Docs */}
            <TabPanel value={value} index={1}>
              {newFiles?.map((item) => (
                  <NewFileItem
                      key={item.id}
                      author={item.userName}
                      fileName={item.fileName}
                      fileId={item.id} status={0}
                  />
              ))}
              {!newFiles?.length && <i>There are no new documents</i>}
            </TabPanel>

            {/* Tab Panel for My Files */}
            <TabPanel value={value} index={2}>
              {myFile?.map((item) => (
                  <MyFile
                      key={item.id}
                      author={item.userName}
                      fileName={item.fileName}
                      status={0}
                      fileId={''}
                  />
              ))}
              {!myFile?.length && <i>There are no completed documents</i>}

              <Typography variant="h6">Upload your document</Typography>

              {/* Upload Button that opens the dialog */}
              <Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleClickOpen} // Opens the dialog
                    sx={{ marginTop: '20px' }}
                >
                  Upload Files
                </Button>
              </Box>

              {/* Dialog (Pop-up) */}
              <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Upload File</DialogTitle>
                <DialogContent>
                  <form>
                    <Typography>Choose file:</Typography>
                    <input type="file" onChange={handleFileChange} />

                    <Typography sx={{ marginTop: '20px' }}>Private key file:</Typography>
                    <input type="file" onChange={handleKeyFileChange} />
                  </form>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="secondary">
                    Cancel
                  </Button>
                  <Button
                      variant="contained"
                      color="primary"
                      onClick={handleFileUpload}
                      disabled={!selectedFile || !keyFile} // disable if files are not selected
                  >
                    Upload Files
                  </Button>
                </DialogActions>
              </Dialog>
            </TabPanel>

            {/* Tab Panel for Upload */}
            <TabPanel value={value} index={3}>
              {fileOtherAccepted?.map((item) => (
                  <MyRequestFileItem
                      key={item.id}
                      ownerName={item.ownerName}
                      fileName={item.fileName}
                      status={item.status}
                      fileId={item.fileId}
                      id={item.id}
                  />
              ))}
            </TabPanel>

            {/* Tab Panel for Upload */}
            <TabPanel value={value} index={4}>
              {requestedFiles?.map((item) => (
                  <RequestedItem
                      key={item.id}
                      author={item.requesterName}
                      fileName={item.fileName}
                      status={item.status}
                      fileId={item.fileId}
                      id={item.id}
                  />
              ))}
              {!requestedFiles?.length && <i>There are no requested file</i>}
            </TabPanel>
          </Box>
        </Box>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          position: 'absolute',
          bottom: '0',
          width: '100%',
          backgroundColor: '#333333',
          color: '#ffffff',
          padding: '10px'
        }}>
          <Button onClick={()=>{
            removeCookie('uid');
            router.push('/login');
          }}>
            sign out
          </Button>
        </Box>
      </Box>
  );
}
