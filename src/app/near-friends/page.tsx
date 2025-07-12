'use client'

import { FC, useEffect, useState } from "react"
import useGetEmail from "../useGetEmail"
import useCheckReg from "../CheckReg"
import UserInterface from "../UserInterface"
import Map from "../Map"

const NearFriends: FC = () => {

    const {} = useCheckReg()
    const { email } = useGetEmail() 

    const [nearUsers, setNearUsers] = useState <UserInterface[] | null> (null)
    const [targetUser, setTargetUser] = useState <UserInterface | null> (null)
    let mainShow;
    let nearArr;

    if (nearUsers === null) {
        nearArr = <h2>Загрузка...</h2>
    } else {
        if (nearUsers.length !== 0) {
            nearArr = <div>
                <ul>
                    {nearUsers.map((item, index) => {
                       if (item.email !== email) {
                        return <li key={index}>
                        <div>
                            <h3 onClick={() => window.location.href=`${item.email}`}>{item.email}</h3>
                            <button onClick={() => setTargetUser(item)}>Показать на карте</button>
                        </div>
                    </li>
                    }
                })}
                </ul>
            </div>
        } else {
            nearArr = <h2>Нет пользователей поблизости</h2>
        }
    }

    if (targetUser === null) {
        mainShow = <div>
            {nearArr}
        </div>
    } else {
        mainShow = <Map targetUser={targetUser} setTargetUser={setTargetUser}/>
    }

    useEffect(() => {
        if (email !== '') {
            const getNearUsers = async () => {
                const allUsers = await fetch('http://localhost:4000/users-controller/get/all/users')
                const resultUsers = await allUsers.json()
                const onlyCoordsUsers = resultUsers.filter((el: any) => el.latitude !== null)
                const findMe = onlyCoordsUsers.find((el: any) => el.email === email)
                const myLatitude = findMe.latitude
                const myLongitude = findMe.longitude
                let resultNearUsers = []
                for (let item of onlyCoordsUsers) {
                    let rLatitude = 0
                    if (myLatitude > item.latitude) {
                        rLatitude = myLatitude - item.latitude
                    } else {
                        rLatitude = item.latitude - myLatitude
                    }
                    if (rLatitude <= 2) {
                        let rLongitude = 0
                        if (myLatitude > item.longitude) {
                            rLongitude = myLatitude - item.longitude
                        } else {
                            rLongitude = item.longitude - myLongitude
                        }
                        if (rLongitude <= 2) {
                            resultNearUsers.push(item)
                        }
                    }
                }
                setNearUsers(resultNearUsers)
            }
            getNearUsers()
        }
    }, [email])

    return (
        <div>
            {mainShow}
        </div>
    )
}

export default NearFriends