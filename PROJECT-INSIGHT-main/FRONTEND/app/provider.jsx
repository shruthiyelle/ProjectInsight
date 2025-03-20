
"use client"
import React, { useState } from 'react'
import { Pathcontext } from './context/filecontext';
import Header from '@/components/header';

const Provider = ({children}) => {
    const [filePath, setFilePath] = useState("");
  return (
    <Pathcontext.Provider value={{filePath, setFilePath}}>
<Header/>
        {children}
    </Pathcontext.Provider>
  )
}

export default Provider