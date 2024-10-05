'use client'
import Box from "@mui/material/Box";
import {Button, TextField, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import axios from "axios";
import {useRouter} from "next/navigation";
import {useCookies} from 'react-cookie';


export default function Page() {
    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [cookies, setCookie] = useCookies(['uid'])

    const router = useRouter()
    const setPass = (event: any)=>{
        setPassword(event.target.value)
    }
    const setUser = (event: any)=>{
        setUserName(event.target.value)
    }
    const loginFunc = async () => {
        const data = {
            email: userName,
            password: password
        }
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_HOST_API}/api/block-chain/v1/user/login`, data)
            console.log("res.data", res.data)
            if (res.data && !res.data.error && res.data.isLoginSuccess) {
                setCookie('uid', res.data.userId)
                router.push('/')
            } else {
                alert( res.data.error || 'Login failed')
            }
        } catch (e) {
            alert('Login failed')
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
                    <Typography variant={'h3'} color="secondary">login</Typography>
                </Box>
                <Box sx={{
                    marginTop: '30px',
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
                        onChange={(event: any)=>{setUser(event)}}
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
                        size={'large'}
                        variant='contained'
                        sx={{
                            color:'#ffffff'
                        }}
                        onClick={()=>{loginFunc()}}
                    >
                        Sign in
                    </Button>
                    <Button
                        color={'secondary'}
                        size={'large'}
                        variant='contained'
                        sx={{
                            color:'#ffffff',
                            marginLeft: '10px'
                        }}
                        onClick= {()=>{router.push('/register')}}
                    >
                        Register
                    </Button>
                </Box>
            </Box>

        </Box>
    )
}
