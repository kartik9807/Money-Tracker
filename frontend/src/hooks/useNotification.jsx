import {useContext} from 'react'
import { NotificationContext } from '../context/NotificationContext.jsx'

export const useNotification = () => {
    return useContext(NotificationContext)
}