'use client'
import Box from "@mui/material/Box";
import {Button, TextField, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import axios from "axios";
import {useRouter} from "next/navigation";
import {useCookies} from 'react-cookie';


export default function Page() {
    const [userName, setUserName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [cookies, setCookie] = useCookies(['uid'])

    const router = useRouter()
    const setPass = (event: any)=>{
        setPassword(event.target.value)
    }
    const setUser = (event: any)=>{
        setUserName(event.target.value)
    }

    const setEmailString = (event: any)=>{
        setEmail(event.target.value)
    }
    const registerFunction = async () => {
        const data = {
            userName: userName,
            password: password,
            email: email
        }
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_HOST_API}/api/block-chain/v1/user/register`, data)
            if (res.data && !res.data.error) {
                alert('Register success!!!!!')
                router.push('/login')
            } else {
                alert('Register failed')
            }
        } catch (e) {
            alert('Register failed')
        }
    }
    useEffect(() =>{
        console.log("cookies", cookies)
        if (cookies.uid) {
            router.push('/')
        }
    }, [])
    return (
        <Box sx={{
            // width:'200vh',
            height:'100vh',
            backgroundColor:'#f0f0f0',
            display: 'flex',
            alignItems:'center',
            flexDirection: 'column',
            paddingTop: '30px',
            justifyContent: 'center'
        }}>
            <Box sx={{
                height:'60vh',
                borderRadius: '8px',
                margin: 'auto',
                width: '35%',
                padding: '50px',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems:'center',
                flexDirection: 'column',
                paddingTop: '30px',
            }}>
                <Box
                    sx={{
                        marginTop: '20px',
                        // width: '50%'
                    }}
                >
                    <Typography variant={'h3'} color="secondary"> Register</Typography>
                </Box>
                <Box sx={{
                    // marginTop: '20px'
                    width: '50%'
                }}>
                    <TextField
                        label={"username"}
                        id="username"
                        variant="filled"
                        color="secondary"
                        margin="normal"
                        focused
                        fullWidth
                        onChange={(event: any)=>{setUser(event)}}

                    />
                </Box>
                <Box sx={{
                    width: '50%'
                }}>
                    <TextField
                        label={"email"}
                        id="email"
                        variant="filled"
                        color="secondary"
                        margin="normal"
                        focused
                        fullWidth
                        onChange={(event: any)=>{setEmailString(event)}}
                    />
                </Box>
                <Box sx={{
                    // marginTop: '20px'
                    width: '50%'
                }}>
                    <TextField
                        // id="filled-password-input"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        variant="filled"
                        color="secondary"
                        margin="normal"
                        focused
                        fullWidth
                        onChange={(event: any)=>{setPass(event)}}

                    />
                </Box>
                <Box sx={{
                    marginTop: '20px'
                }}>
                    <Button
                        color={'secondary'}
                        size={'medium'}
                        variant='contained'
                        sx={{
                            color:'#ffffff',
                            width: '100px'
                        }}
                        onClick={()=>{registerFunction()}}
                    >
                        register
                    </Button>
                    <Button
                        color={'secondary'}
                        size={'medium'}
                        variant='contained'

                        sx={{
                            color:'#ffffff',
                            marginLeft: '20px',
                            width: '100px'
                        }}
                        onClick={()=>{router.push('/login')}}
                    >
                       login
                    </Button>
                </Box>
                <Box sx={{
                    marginTop: '20px'
                }}>
                    <Button
                        color={'secondary'}
                        size={'medium'}
                        variant='contained'

                        sx={{
                            color:'#ffffff',
                            marginLeft: '20px',
                        }}
                    >
                        <a href={`${process.env.NEXT_PUBLIC_HOST_API}/api/block-chain/v1/user/gen-key`} download>Generate key</a>
                    </Button>
                </Box>
            </Box>

        </Box>
    )
}
