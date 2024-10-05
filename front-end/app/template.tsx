'use client'
import {ThemeProvider} from "@mui/material";
import {theme} from "@/theme.config";
import { CookiesProvider } from 'react-cookie';

export default function Template({children,}: { children: React.ReactNode }) {
    return (
        <>
            <CookiesProvider>
                <ThemeProvider theme = {theme}>
                    {children}
                </ThemeProvider>
            </CookiesProvider>
        </>
    )
}
