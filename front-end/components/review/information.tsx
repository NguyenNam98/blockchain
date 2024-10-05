'use client'
import React from "react";
import { Typography} from "@mui/material"
import Box from "@mui/material/Box";
import {styled} from "@mui/system";

const TypographyBig = styled(Typography)(({ theme }) => ({
    fontSize: 17,
    fontWeight: 'bold',
    paddingRight: '5px'
}))

interface quizzInfoType {
    completedAt: string
    score : string
    title: string
    description: string
}
export default function Information(props: quizzInfoType) {
    const {completedAt, score, title, description} = props
    return (
        <Box sx={{
            // backgroundColor: '#bad9de'
            padding: '20px'
        }}>
            <Box sx={{
                display: 'flex',

            }}>
                <TypographyBig >Title:</TypographyBig>
                <Typography>{title} </Typography>

            </Box>
            <Box sx={{
                display: 'flex'

            }}>
                <TypographyBig>Description: </TypographyBig>
                <Typography>{description} </Typography>

            </Box>
            <Box sx={{
                display: 'flex'

            }}>
                <TypographyBig>Date finished: </TypographyBig>
                <Typography>{completedAt} </Typography>

            </Box>
            <Box sx={{
                display: 'flex'

            }}>
                <TypographyBig>Score: </TypographyBig>
                <Typography>{score} </Typography>

            </Box>

        </Box>
    )
}
