import { useState,useEffect } from "react";
import { AccountContext } from "./AccountContext.jsx";
import { createAccount, deleteAccount, getAccounts, updateAccount } from "../services/accountService.js";

export const AccountProvider = ({children})=>{
    const [Accounts, setAccounts] = useState([]);

    const checkAccounts = async()=>{
        try {
            const response = await getAccounts();
            if(response.success){
                setAccounts(response.data);
            }
        } catch (error) {
            setAccounts([]);
        }
    }

    const addAccount = async(payload)=>{
        try {
            const response = await createAccount(payload);
            if(response.success){
                setAccounts([...Accounts,response.data]);
            }
            return response;
        } catch (err) {
            console.log("error in adding account",err);
            throw err;
        }
    }

    const editAccount = async(id,payload)=>{
        try {
            const response = await updateAccount(id,payload);
            if (!response.success) {
                throw new Error(response.message || "Failed to update account");
            }
            setAccounts((prev)=>prev.map((account)=>(account._id === id)?{...account,...payload}:account));
            return response;
        } catch (err) {
            console.log("error in editing account",err);
            throw err;
        }
    }

    const removeAccount = async(id)=>{
        try {
            const response = await deleteAccount(id);
            if(!response.success){
                throw new Error(response.message || "Failed to delete the bank account");
            }
            setAccounts((prev)=>prev.filter((account)=>account._id !== id))
            return response;
        } catch (err) {
            console.log("error in deleting account",err);
            throw err;
        }
    }

    useEffect(() => {
      const init = async()=>{
        await checkAccounts();
      }
      init();
    }, [])
    
    return(
        <AccountContext.Provider 
            value={{
                Accounts,
                addAccount,
                editAccount,
                removeAccount
            }}
        >
            {children}
        </AccountContext.Provider>
    )
}