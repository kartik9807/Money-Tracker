import {useContext} from 'react'
import { TransactionContext } from '../context/TransactionContext.jsx'

export const useTransaction = () => {
    return useContext(TransactionContext)
}