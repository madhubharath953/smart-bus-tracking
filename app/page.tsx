import Sidebar from "./component/Sidebar";
import ChatBot from "./component/Chatbox";
import Navbar from "./component/Navbar";
export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-hidden relative">
          
        </main>
      </div>
      <ChatBot />
    </div>
  );
}
