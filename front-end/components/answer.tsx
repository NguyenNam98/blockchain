'use client' // Error components must be Client Components

import React, { useState} from "react";
import {styled} from "@mui/system";
import {Button} from "@mui/material";

const ButtonSelect = styled(Button)(({ theme }) => ({
    color: '#ffff',
    marginTop: 8
}))

interface answerProps {
    isClicked: boolean
    setAnswer: Function
    item: {
        id : string,
        answer_text: string
    }
    answer: any
}
export default function Answer(props: answerProps) {
    const {isClicked, setAnswer, item, answer} = props
    const [clicked, setClicked] = useState(isClicked)
    const setStateClicked = (id: string) => {
        setClicked((click) => !click)
        setAnswer(id)
    }
    return (
        <ButtonSelect
            variant="contained"
            color={clicked ? 'success': 'secondary'}
            onClick={(event) => {setStateClicked(item.id)}}
        >
            {item.answer_text}
        </ButtonSelect>
    )
}
