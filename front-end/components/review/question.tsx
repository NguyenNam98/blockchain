'use client'
import React from "react";
import { Checkbox, List, ListItem, ListItemIcon, ListItemText, Typography} from "@mui/material"
import Box from "@mui/material/Box";
import CloseIcon from '@mui/icons-material/Close'
import DoneIcon from '@mui/icons-material/Done'
import {questionInfoType} from "@/app/result/[id]/page";

interface typeAnswers {
    [key: string]: {
        id: string,
        answer_text: string
    }
}

 interface propsQuestionType {
    index: number
     questionInfo: questionInfoType
 }

export default function Question(props: propsQuestionType) {
    const {index, questionInfo} = props
    const isCorrectAnswer = questionInfo.rightAnswer.every(item => questionInfo.userSelected.includes(item)) &&
        questionInfo.rightAnswer.length === questionInfo.userSelected.length
    const objectAnswer  = questionInfo.answers.reduce((prev: typeAnswers, item )=> {
        prev[item.id] = item
        return prev
    }, {})
    return (
        <Box sx={{
            padding: '20px',
            display: 'flex',
        }}>
            <Box sx={{
                width: '15%',
                padding: '5px',
                height: '120px',
                border: '1px solid #888888',
                backgroundColor: '#F0F0F0',
                marginRight: '20px',
                fontSize: '12px'
            }}>
                <Typography >Question {index}:</Typography>
                <Typography >
                    {
                        isCorrectAnswer ? 'Correct' : 'Incorrect'
                    }
                </Typography>

            </Box>
            <Box sx={{
                // display: 'flex'
                backgroundColor: '#eff9fc',
                padding: '10px',
                width: '80%'

            }}>
                <Typography>{questionInfo.questionText} </Typography>
                <List>
                    {
                        questionInfo.answers.map(item => {
                            return (
                                <ListItem>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={questionInfo.userSelected.includes(item.id)}
                                            tabIndex={-1}
                                            disableRipple
                                            // inputProps={{ 'aria-labelledby': labelId }}
                                            color={'secondary'}
                                        />
                                    </ListItemIcon>
                                    <ListItemText>
                                        {
                                            item.answer_text
                                        }
                                    </ListItemText>
                                    <ListItemIcon>
                                    {
                                        questionInfo.userSelected.includes(item.id) ?  questionInfo.rightAnswer.includes(item.id) ?
                                            <DoneIcon color={'success'}/> : <CloseIcon color={'error'}/> : ''


                                    }
                                    </ListItemIcon>
                                </ListItem>
                            )
                        })
                    }
                </List>
                {
                    !isCorrectAnswer &&
                    <Box sx={{
                        backgroundColor: '#fcefdc',
                        color: '#8e662e',
                        padding: '10px'
                    }}>
                        <Typography>Your answer is incorrect. </Typography>
                        <Typography>The correct answer is: </Typography>
                        {
                            questionInfo.rightAnswer.map(item => {
                                return (
                                    <Typography>
                                        {
                                            objectAnswer[item].answer_text
                                        }
                                    </Typography>
                                )
                            })
                        }
                    </Box>
                }
            </Box>

        </Box>
    )
}
