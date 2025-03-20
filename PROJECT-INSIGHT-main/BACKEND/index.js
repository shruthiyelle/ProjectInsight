import fg from 'fast-glob';
import fs from 'fs/promises';
import path from 'path';
import express from 'express';
import cors from 'cors'
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } from "@google/generative-ai";
  const app = express();
  const port = 4000;
  app.use(express.json());
  app.use(cors())
// async function readAllFiles(paths) {
    
//   try {
//     let text=""
//     const baseDir = paths;
    
//    // const baseDir = "C:\Users\adepu\OneDrive\Desktop\project-insight-main";

    
//     const files = await fg(['**/*', '!**/node_modules/**', '!**/package-lock.json'], {
//       cwd: baseDir,
//       onlyFiles: true
//     });
    
//     const fileContents = await Promise.all(
//       files.map(async (relativeFilePath) => {
//         const filePath = path.join(baseDir, relativeFilePath);
//         const content = await fs.readFile(filePath, 'utf8');
//         return { filePath, content };
//       })
//     );
    
//     fileContents.forEach(({ filePath, content }) => {
//      text+=`Content of ${filePath}:     \n${content}\n`
     
//     });
//    console.log(text);
//     return Object.assign({}, ...fileContents);
//   } catch (err) {
//     console.error('Error reading files:', err);
//   }

// }
async function readAllFiles(paths) {
  try {
    let text = "";
    const baseDir = paths;

    const files = await fg(['**/*', '!**/node_modules/**', '!**/package-lock.json','!**/package.json'], {
      cwd: baseDir,
      onlyFiles: true
    });

    let fileContents = {};  // Store as an object instead of array
    for (const relativeFilePath of files) {
      const filePath = path.join(baseDir, relativeFilePath);
      const content = await fs.readFile(filePath, 'utf8');
      
      fileContents[filePath] = content;  // Store each file properly
      text += `Content of ${filePath}:\n${content}\n`;
    }

    //console.log(text);
    return fileContents;  // Return object instead of merging with Object.assign
  } catch (err) {
    console.error('Error reading files:', err);
  }
}


//let x= await readAllFiles();
//console.log(x);





const apiKey = "AIzaSyBNTGpOORFly1qJUdAOm6IuoVQz29__UXM";
const genAI = new GoogleGenerativeAI(apiKey);


  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
    
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  async function insight(text) {
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
            role: "user",
            parts: [
              {text: "you are a advanced programmer and give me insight of the project and the files in the project if there are any vulnerabilities or errors or improvements in the files give them in a list in 4-5 lines max" },
            ],
          }
      ],
    });
  
    const result = await chatSession.sendMessage(JSON.stringify(text));
    
    return result.response.text();
  }
  
  const generationConfig2 = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };


  
  // async function update(tes,x) {
  //   const model1 = genAI.getGenerativeModel({
  //       model: "gemini-2.0-pro-exp-02-05",
  //       systemInstruction:` you are a advanced programmer, give code to update the project keeping the given improvements and vulnerabilities in the files in the project in mind. the output should be in same language as input
  //                                         the given output should be in the form of {"C:\\Users\\adepu\\OneDrive\\Desktop\\project-insight-main\\project-insight-main\\index.js":"code of the file",
  //                                         "C:\\Users\\adepu\\OneDrive\\Desktop\\project-insight-main\\project-insight-main\\package.json":"code of the file "}
  //                                         it should not keep any language name in it or anything in it. the output should be in a json format stictly like this. it should not contain any extra text. take the filepath from given data above. 
  //                                           `
        
  //     });

  //   const chatSession1 = model1.startChat({
  //       generationConfig2,
  //     history: [
  //       {
  //           role: "user",
  //           parts: [
  //             {text: x+ "\n "+ tes+"\n " },
  //           ],
  //         }
  //     ],
  //   });
  
  //   const result = await chatSession1.sendMessage("give the updated files in a json format correct way the updates file should have the same name as the original file");
  //   console.log(result.response.text());
  //   //console.log(JSON.parse(result.response.text().replace("```json","").replace(/.{3}$/, '')));
  //   return JSON.parse(result.response.text().replace("```json","").replace(/.{3}$/, ''))
    
  // }
  async function getUpdatedCode(filePath, content) {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });
  
    const chatSession = model.startChat({
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      },
      history: [
        {
          role: "user",
          parts: [{
            text: `Here is a file: ${filePath}\n${content}\n\nPlease update this code with improvements, fixes, and optimizations while keeping the structure and functionality intact.and remove any vulnerabilities if found like API`
          }],
        }
      ],
    });
  
    const result = await chatSession.sendMessage("Provide the updated code only, without extra text. and without any language name in it");
    return result.response.text();
  }
  async function updateProjectFiles(fileData) {
    let updatedFiles = {};
  
    for (const [filePath, content] of Object.entries(fileData)) {
      try {
        console.log(`Updating: ${filePath}`);
        const updatedCode = await getUpdatedCode(filePath, content);
        updatedFiles[filePath] = updatedCode.replace("```javascript","").replace(/.{3}$/, '');
      } catch (error) {
        console.error(`Error updating file ${filePath}:`, error);
      }
    }
  
    return updatedFiles;
  }
    

  async function applyUpdates(updates) {
    // Iterate over each file update provided in the JSON object
    for (const [filepath, newCode] of Object.entries(updates)) {
      // Resolve the full file path relative to the current working directory
      
      try {
        
        // Write the new code into the file using utf8 encoding
        await fs.writeFile(filepath, newCode, 'utf8');
        console.log(`File "${filepath}" updated successfully.`);
      } catch (error) {
        console.error(`Error updating file "${filepath}":`, error);
      }
    }
  }


  app.post('/update', async (req, res) => {
    try {
      console.log(req.body.paths);
      const baseDir = req.body.paths;
      if (!baseDir) return res.status(400).json({ error: "Path is required." });
      const filesText = await readAllFiles(baseDir);
      
      const insights = await insight(filesText);
      const updates = await updateProjectFiles(filesText);
      console.log("...........................................................................................");
     //console.log(updates);
      res.json({ message: "Updates applied successfully", updates ,filesText,insights});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  app.post('/changecode', async (req, res) => {
    try {
      console.log(req.body.updated);
      const code = req.body.updated;
     
      await applyUpdates(code);
      
      
     
      console.log("...........................................................................................");
     console.log("Updates applied successfully");
      res.json({ message: "Updates applied successfully"});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/getfiles', async (req, res) => {
    try {
      console.log(req.body.paths);
      const code = req.body.paths;
     
      const filesText = await readAllFiles(code);
      
      
     
      console.log("...........................................................................................");
     console.log("sent successfully");
      res.json({ filesText});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post('/mrk', async (req, res) => {
    try {
      
      const md = req.body.mrk;
     const paths= req.body.pths;
     console.log(paths+"sss");
     const fileName = "readme.md";
// Full file path for the markdown file
    const fullpath = path.join(paths, fileName);

    fs.writeFile(fullpath, md, (err) => {
      if (err) {
          console.error("Error writing file:", err);
      } else {
          console.log("Markdown file created or overwritten successfully at", fullpath);
      }
  });
      
     
      console.log("...........................................................................................");
     console.log("sent successfully");
      res.json("created");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



  
  // let y= await insight(x);
  // console.log(y);
  // console.log("............................................................................................");
  // let z= await update(x,y)
  // console.log(z)
//applyUpdates(z);


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});