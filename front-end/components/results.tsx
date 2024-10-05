import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Link from "next/link";

interface resultType {
    open: boolean
    setOpen: Function
    score: string
}
export default function ResponsiveDialog(props: resultType) {
    const {open, setOpen, score}  = props
    // const [open, setOpen] = React.useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
            sx={{
                textAlign: 'center',
            }}
            maxWidth='xl'
        >
            <DialogTitle id="responsive-dialog-title" sx={{
                backgroundColor: '#6eafb4',
                padding: 15,
                fontSize: 32,
                color: '#ffffff',
            }}>
                {"Congratulation !"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    You completed your quiz !!!!!
                </DialogContentText>
                <DialogContentText>
                    {score}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color={'secondary'} autoFocus onClick={handleClose}>
                    <Link href='/'>Home</Link>
                </Button>
            </DialogActions>
        </Dialog>
    );
}