'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, conversations } from '../../../lib/api';
import Alert from '../../../components/Alert';

export default function CompteDiscussionPage() {
  const router = useRouter();
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('urbans_token') : null;
    if (!token) {
      router.replace('/compte?redirect=/compte/discussion');
      return;
    }
    try {
      const user = await auth.me();
      if (user?.role === 'admin') { router.replace('/admin'); return; }
      const data = await conversations.getMine();
      if (!data.conversation) {
        setConv(null);
        setMessages([]);
        setLoading(false);
        return;
      }
      setConv(data.conversation);
      const msgs = await conversations.getMessages(data.conversation.conversation_id);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleStartOrSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    setError('');
    try {
      if (!conv) {
        const data = await conversations.createMine();
        setConv(data);
        const sent = await conversations.sendMessage(data.conversation_id, content.trim());
        setMessages([sent]);
        setContent('');
      } else {
        const msg = await conversations.sendMessage(conv.conversation_id, content.trim());
        setMessages((prev) => [...prev, msg]);
        setContent('');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="text-urbans-warm/70 py-6 container-page">Chargement…</p>;

  return (
    <div className="container-page py-8 min-w-0 flex flex-col min-h-[70vh]">
      <div className="mb-4 flex items-center gap-4">
        <Link href="/compte" className="text-urbans-warm/80 hover:text-urbans-noir">← Compte</Link>
        <h1 className="page-title-sm">Discussion avec le support</h1>
      </div>
      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="card flex-1 flex flex-col min-h-0 p-4">
        <p className="text-sm text-urbans-warm/70 mb-4">Posez votre question ou décrivez votre demande. L’équipe UrbanS vous répondra sous peu.</p>
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[120px]">
          {messages.length === 0 && !content && (
            <p className="text-urbans-warm/60 text-sm">Aucun message. Écrivez ci-dessous pour démarrer la conversation.</p>
          )}
          {messages.map((m) => (
            <div key={m.message_id} className={`flex ${m.from_admin ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${m.from_admin ? 'bg-urbans-sand text-urbans-noir' : 'bg-urbans-gold/20 text-urbans-noir'}`}>
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                <p className="text-[10px] mt-1 opacity-70">{new Date(m.created_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleStartOrSend} className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Votre message…"
            className="input-field flex-1"
            disabled={sending}
          />
          <button type="submit" disabled={sending || !content.trim()} className="btn-primary shrink-0">
            {sending ? 'Envoi…' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
}
