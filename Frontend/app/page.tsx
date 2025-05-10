import Header from "@/components/ui/header"
import ChatInterface from "@/components/chat/chat-interface"
import AuthCheck from "@/components/auth/auth-check"

export default function Home() {
  return (
    <AuthCheck>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <Header />
        <ChatInterface />
      </div>
    </AuthCheck>
  )
}
