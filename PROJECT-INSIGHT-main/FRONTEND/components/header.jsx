"use client"

import { useContext, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Pathcontext } from "@/app/context/filecontext"

export default function Header() {
  const [activeTab, setActiveTab] = useState("insight")

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }
const router = useRouter();
const {filePath, setFilePath} = useContext(Pathcontext)
  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            variant={activeTab === "insight" ? "default" : "ghost"}
            onClick={() => {handleTabChange("insight")
                router.push("/insight")
            }}
            className="font-medium"
          >
            Insight
          </Button>
          {filePath&&<div>
          <Button
            variant={activeTab === "chat" ? "default" : "ghost"}
            onClick={() =>{ handleTabChange("chat")
                router.push("/chat")
            }}
            className="font-medium"
          >
            Chat
          </Button>
          <Button
            variant={activeTab === "readme" ? "default" : "ghost"}
            onClick={() =>{ handleTabChange("readme")
                router.push("/markdown")
            }}
            className="font-medium"
          >
            Readme
          </Button>
          </div>}
        </div>

        <div className="flex items-center space-x-4">
          {/* You can add additional elements on the right side if needed */}
        </div>
      </div>
    </header>
  )
}

