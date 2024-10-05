import {Typography} from "@mui/material";
import React from "react";
import Box from "@mui/material/Box";

interface TabPanelProps {
    children?: React.ReactNode
    index: any
    value: number
}

export default function TabPanel(props: TabPanelProps) {
    const { children, value, index } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    )
}