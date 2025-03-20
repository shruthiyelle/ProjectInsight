"use client";
import ReactMarkdown from "react-markdown";
import { useContext, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileCode } from "lucide-react";
import ReactDiffViewer from "react-diff-viewer-continued";
import { Pathcontext } from "../context/filecontext";

const customStyles = {
  variables: {
    light: {
      diffViewerBackground: "#f8f9fa",
      diffViewerColor: "#212529",
      addedBackground: "#e6ffec",
      addedColor: "#24292f",
      removedBackground: "#ffebe9",
      removedColor: "#24292f",
      wordAddedBackground: "#acf2bd",
      wordRemovedBackground: "#fdb8c0",
    },
    dark: {
      diffViewerBackground: "#151718",
      diffViewerColor: "#fff",
      addedBackground: "#044B53",
      addedColor: "#fff",
      removedBackground: "#632F34",
      removedColor: "#fff",
      wordAddedBackground: "#055d67",
      wordRemovedBackground: "#7d383f",
    }
  },
  contentText: {
    fontSize: "0.875rem",
    lineHeight: "1.5",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  line: {
    padding: "4px 8px",
  },
  codeFold: {
    backgroundColor: "inherit",
  }
};

export default function ProjectInsight() {
  
  const {filePath, setFilePath} = useContext(Pathcontext)
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async () => {
    if (!filePath) {
      alert("Please enter a file directory path");
      return;
    }
    setFilePath(filePath.replace(/\\/g, "/"));
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paths: filePath.replace(/\\/g, "/") }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Error fetching project insights:", error);
      alert("Failed to fetch insights. Check console for details.");
    } finally {
      setLoading(false);
    }
  };
const updatecode= async ()=>{
  setLoading(true);
  try {
    const res = await fetch("http://localhost:4000/changecode", {
      method: "post",
      body: JSON.stringify({ updated: response.updates }),
      headers: {
        "Content-Type": "application/json",
      }
      
    });
    const data = await res.json();
    
    
  } catch (error) {
    console.error("dsfsdf:", error);
    alert("Failed to fetch insights. Check console for details.");
  } finally {
    setLoading(false);
  }
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <Card className="max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="w-6 h-6" />
            Project Insight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="Enter file directory path"
              className="flex-1"
            />
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[140px]"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Processing..." : "Analyze"}
            </Button>
          </div>

          {response && (
            <>
            <Tabs defaultValue="diff" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="diff">Code Changes</TabsTrigger>
                <TabsTrigger value="insights">Analysis</TabsTrigger>
              </TabsList>
              <TabsContent value="diff">
                <ScrollArea className="h-[600px] rounded-md border">
                  <div className="p-4 space-y-8">
                    {Object.keys(response.updates).map((filePath) => (
                      <div key={filePath} className="overflow-hidden">
                        <h3 className="text-sm font-medium mb-2 px-2">{filePath}</h3>
                        <div className="overflow-x-scroll ">
                          <ReactDiffViewer
                            oldValue={response.filesText[filePath] || ""}
                            newValue={response.updates[filePath] || ""}
                            splitView={false}
                            useDarkTheme={true}
                            styles={customStyles}
                            leftTitle="Current Code"
                            rightTitle="Updated Code"
                            hideLineNumbers={false}
                            renderContent={(str) => str}
                            extraLinesSurroundingDiff={3}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="insights">
                <ScrollArea className="h-[600px] rounded-md border p-4">
                  <pre className="text-sm whitespace-pre-wrap">
                  <ReactMarkdown>{response.insights}</ReactMarkdown>
                  
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
            <Button onClick={updatecode}>change</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}