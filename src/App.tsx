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
import Notifications from "@/pages/Notifications"; // Import the new page
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
              {/* Home / Feed */}
              <Route path="/" element={<FeedPage />} />
              
              {/* Authentication */}
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Profiles */}
              <Route path="/profile/:username" element={<ProfilePage />} />
              
              {/* Blog Posts */}
              <Route path="/post/:slug" element={<PostPage />} />
              
              {/* Writing / Editing */}
              <Route path="/editor" element={<EditorPage />} />
              
              {/* Direct Messaging */}
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/:username" element={<MessagesPage />} />
              
              {/* Notifications - NEW ROUTE */}
              <Route path="/notifications" element={<Notifications />} />
              
              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;