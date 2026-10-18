import {useContext} from 'react'
import { AccountContext } from '../context/AccountContext.jsx'

export const useAccount = () => {
    return useContext(AccountContext)
}