'use client'

import { FC, useEffect } from "react"
import Calendar, { CalendarProps } from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { useState } from "react"

interface CalendarCompProps{
    setCalendar: Function;
    email: string;
    setBirthday: Function;
}

const CalendarComp: FC <CalendarCompProps> = (props) => {

    const [date, setDate] = useState<CalendarProps['value']>(new Date())

    const saveBirthday = async () => {
        const email = props.email
        const selectedDate = date as Date
        const day = selectedDate.getDate()
        const month = selectedDate.getMonth() + 1
        const resultDate = day + '.' + month
        await fetch('http://localhost:4000/users-controller/add/birthday', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, resultDate })
        })
        props.setBirthday(resultDate)
        props.setCalendar(false)
    }

    return (
        <div>
            <p onClick={() => props.setCalendar(false)}>X</p>
            <Calendar 
                onChange={setDate} 
                value={date} 
            />
            <button onClick={saveBirthday}>Сохранить</button>
        </div>
    )
}

export default CalendarComp