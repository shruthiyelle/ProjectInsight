"use client";

import MDEditor from '@uiw/react-md-editor';



import React, {  useContext, useEffect, useState } from 'react'

import { useTheme } from 'next-themes';


import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Pathcontext } from '../context/filecontext';
import { FolderDown } from 'lucide-react';

const Markdown = () => {
    const { theme } = useTheme()
   
    const [mdx, setmdx] = useState("")
  const [files, setfiles] = useState()
    const [error, seterror] = useState(false)
    const router = useRouter()
     const {filePath, setFilePath} = useContext(Pathcontext)


    console.log(theme)





    const {
      GoogleGenerativeAI,
      HarmCategory,
      HarmBlockThreshold,
    } = require("@google/generative-ai");
    
    const apiKey =  "AIzaSyBNTGpOORFly1qJUdAOm6IuoVQz29__UXM";
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      systemInstruction: "Analyze the provided GitHub repository and generate a high-quality, professional README file in Markdown format. The README must include a centered project title followed by relevant badges sourced from valid platforms. Write a concise project description introducing the repository's purpose and functionality, followed by an engaging overview of its main features. Include a well-structured, clickable table of contents to aid navigation. Provide detailed and accurate instructions for installation and setup, specifying where environment variables (if any) should be placed and their required formats. If no environment variables are needed, omit this section entirely.Clearly explain how to run the project with examples of commands or configurations when applicable. List and describe all major dependencies and tools required for the project. Include a contribution guide explaining how developers can participate, along with inferred or placeholder license information where applicable. Add a contact section with placeholder details for maintainers or contributors.Format the README visually and structurally using appropriate Markdown elements, such as headings, subheadings, bullet points, and code blocks, ensuring the output is aesthetically pleasing and optimized for readability. Ensure all information is accurate and non-fabricated, based solely on the repository's structure and content. If a README is already present, extract and adapt relevant details without copying or mimicking its content directly. Deliver the output strictly in valid Markdown format without any additional commentary. ",
    });
    
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };
    
    async function run(data) {
      try{
        const chatSession = model.startChat({
          generationConfig,
          history: [
          ],
        });
      
        const result = await chatSession.sendMessage(JSON.stringify(data));
        return result;
      }
      catch(error){
        seterror(true)
        console.log("error in run")
      }
      
    }

useEffect( ()=>{
  document.documentElement.setAttribute('data-color-mode', theme);
},[theme])
// useeffect to insert in the markdown
useEffect( ()=>{
  document.documentElement.setAttribute('data-color-mode', theme);
  const insert_in_mdx= async ()  => {
      
   
    
    try {
      
        const res = await fetch("http://localhost:4000/getfiles", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ paths: filePath }),
          });
          const data = await res.json();
          console.log(data);
          setfiles(data);
      const repo= await run(data);
      setmdx(repo.response.text().replace("```markdown",""));
      
     
    } catch (error) {
      
      seterror(true)
      //TODO: handle error
    }
        }
        insert_in_mdx();

}, [])

    //use effect ends
const handleClose = () => {
  seterror(false);
  router.back()
}
const download=async ()=>{
    try {
      console.log(filePath)
        const res = await fetch("http://localhost:4000/mrk", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            }, body: JSON.stringify({  mrk:mdx ,pths:filePath}),
            
          });
          const data = await res.json();
          console.log(data);
    
     
   
    } catch (error) {
      
      seterror(true)
      //TODO: handle error
    }
}
  
    return (
      <>
   <Button variant={"outline"} size={"icon"} onClick={download}><FolderDown /></Button>
        <div>
        <div>

<AlertDialog open={error} onOpenChange={seterror}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Error Occurred</AlertDialogTitle>
      <AlertDialogDescription>
       An error occurred while processing your request.Try changing the api key or the repository link. 
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <Button onClick={handleClose} variant="destructive">Retry</Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
</div>
          
      { 
       mdx ?<>
   
   


      <div className="p-2  dark:bg-[#0e131a]">
        <MDEditor
          value={mdx}
          onChange={setmdx}
          height={1200}
          
         />
        </div> 
       </> :<div>loading</div>
        
        }
        
      </div>
      </>
    )
}

export default Markdown