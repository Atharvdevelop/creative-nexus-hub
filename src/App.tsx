import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import FeedPage from "@/pages/FeedPage";
import ProfilePage from "@/pages/ProfilePage";
import PostPage from "@/pages/PostPage";
import EditorPage from "@/pages/EditorPage";
import AuthPage from "@/pages/AuthPage";
import MessagesPage from "@/pages/MessagesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <main className="min-h-[calc(100vh-3.5rem)]">
            <Routes>
              <Route path="/" element={<FeedPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/post/:slug" element={<PostPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/:username" element={<MessagesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
