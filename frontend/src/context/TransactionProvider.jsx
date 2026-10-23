import { useState,useEffect } from "react";
import { TransactionContext } from "./TransactionContext.jsx";
import { createTransaction, getTransactions, updateTransaction,deleteTransaction,deleteRecurring, toggleActiveState, updateRecurringTransaction } from "../services/transactionService.js";

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);

    const checkTransaction = async()=>{
        try {
            const response = await getTransactions();
            if(response.success){
                setTransactions(response.data);
            }
        } catch (err) {
            setTransactions([]);
        }
    }    

    const getTransaction = async()=>{
        try {
            const response = await getTransactions();
            if(response.success){
                setTransactions(response.data);
            }
        } catch (err) {
            setTransactions([]);
        }
    }

    const addTransaction = async(payload)=>{
        try {
            console.log("payload in transaction provider",payload);
            const response = await createTransaction(payload);
            if(response.success){
                setTransactions((prev)=>[...prev,response.data]);
            }
        } catch (error) {
            console.log("error in adding transaction",error);
            throw error;
        }
    }

    const editTransaction = async(id,payload)=>{
        try {
            const response = await updateTransaction(id,payload);
            if(response.success){
                setTransactions((prev)=>prev.map((t)=>{
                    return (t._id === id)?response.data:t;
                }))
            }
        } catch (err) {
            console.log("error in updating transaction",err);
            throw err;
        }
    }

    const editRecurring = async(id,payload)=>{
        try {
            const response = await updateRecurringTransaction(id,payload);
            if(response.success){
                setTransactions((prev)=>prev.map((t)=>{
                    const item = t.recurringTransactionId;
                    return (item && item._id === id)?response.data:t;
                }))
            }
        } catch (err) {
            console.log("error in updating transaction",err);
            throw err;
        }
    }

    const removeTransaction = async(id)=>{
        try {
            const response = await deleteTransaction(id);
            if(response.success){
                setTransactions((prev)=>prev.filter((item)=>item._id !== id))
            }
        } catch (err) {
            console.log("error in deleting transaction",err);
            throw err;
        }
    }

    const removeRecurring = async(id)=>{
        try {
            const response = await deleteRecurring(id);
            if(response.success){
                setTransactions((prev)=>prev.filter((t)=>{
                    const item = t.recurringTransactionId;
                    return (!item || item._id !== id);
                }))
            }
        } catch (err) {
            console.log("error in deleting transaction",err);
            throw err;
        }
    }

    const toggleActive = async(id,isActive)=>{
        try {
            const response = await toggleActiveState(id,{isActive});
            if(response.success){
                setTransactions((prev) =>
                    prev.map((t) => {
                    const item = t.recurringTransactionId;

                    return item && item._id === id
                        ? { ...t, recurringTransactionId: { ...item, isActive } }
                        : t;
                    })
                );
            }
        } catch (err) {
            console.log("error in toggling the active state of recurring transaction",err);
            throw err;
        }
    }

    useEffect(() => {
      const init = async()=>{
        await checkTransaction();
      }
      init();
    }, [])  
    return(
        <TransactionContext.Provider
            value={{transactions,
                getTransaction,
                addTransaction,
                editTransaction,
                removeTransaction,
                toggleActive,
                editRecurring,
                removeRecurring
                }}
        >
            {children}
        </TransactionContext.Provider>
    ) 
}