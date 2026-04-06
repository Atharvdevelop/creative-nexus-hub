import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, useDirectMessages, useSendMessage, useMarkAsRead, Conversation } from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const MessagesPage = () => {
  const { user } = useAuth();
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<{ username: string; full_name: string; profile_picture: string | null } | null>(null);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useConversations(user?.id);
  const { data: messages = [] } = useDirectMessages(user?.id, partnerId ?? undefined);
  const sendMsg = useSendMessage();
  const markRead = useMarkAsRead();

  // Resolve username → partnerId
  useEffect(() => {
    if (!username) { setPartnerId(null); return; }
    supabase.from('profiles').select('user_id, username, full_name, profile_picture')
      .eq('username', username).single()
      .then(({ data }) => {
        if (data) { setPartnerId(data.user_id); setPartnerProfile(data); }
      });
  }, [username]);

  // Select partner from conversation list
  const selectConversation = (c: Conversation) => {
    setPartnerId(c.partner.user_id);
    setPartnerProfile(c.partner);
    navigate(`/messages/${c.partner.username}`);
  };

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Mark as read
  useEffect(() => {
    if (!user) return;
    const unread = messages.filter(m => m.receiver_id === user.id && !m.is_read).map(m => m.id);
    if (unread.length) markRead.mutate({ visibleIds: unread });
  }, [messages, user]);

  const handleSend = () => {
    if (!text.trim() || !user || !partnerId) return;
    sendMsg.mutate({ senderId: user.id, receiverId: partnerId, content: text.trim() });
    setText('');
  };

  if (!user) return <div className="p-8 text-center text-muted-foreground">Please sign in to view messages.</div>;

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-5xl mx-auto border-x border-border">
      {/* Sidebar */}
      <div className={`w-80 border-r border-border flex flex-col ${partnerId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border font-semibold text-lg">Messages</div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>}
          {conversations.map(c => (
            <button key={c.partner.user_id} onClick={() => selectConversation(c)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition text-left ${partnerId === c.partner.user_id ? 'bg-muted' : ''}`}>
              <Avatar className="w-10 h-10">
                {c.partner.profile_picture && <AvatarImage src={c.partner.profile_picture} />}
                <AvatarFallback>{getInitials(c.partner.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-sm truncate">{c.partner.full_name}</span>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.lastMessage.created_at), { addSuffix: true })}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.lastMessage.content}</p>
              </div>
              {c.unreadCount > 0 && <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">{c.unreadCount}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${!partnerId ? 'hidden md:flex' : 'flex'}`}>
        {partnerId && partnerProfile ? (
          <>
            <div className="p-3 border-b border-border flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => { setPartnerId(null); navigate('/messages'); }}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar className="w-8 h-8">
                {partnerProfile.profile_picture && <AvatarImage src={partnerProfile.profile_picture} />}
                <AvatarFallback>{getInitials(partnerProfile.full_name)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{partnerProfile.full_name}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.sender_id === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <Input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message…"
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} />
              <Button size="icon" onClick={handleSend} disabled={!text.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation to start chatting.</div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
