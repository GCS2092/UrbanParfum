'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { admin } from '../../../../lib/api';
import Alert from '../../../../components/Alert';

export default function AdminDiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = () => {
    if (!id) return;
    admin.conversations.getMessages(id)
      .then((data) => {
        setConversation(data.conversation);
        setMessages(data.messages || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      const msg = await admin.conversations.sendMessage(id, content.trim());
      setMessages((prev) => [...prev, msg]);
      setContent('');
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="text-urbans-warm/70 py-6">Chargement…</p>;
  if (error && !conversation) {
    return (
      <div>
        <Alert type="error" message={error}>
          <button type="button" onClick={() => { setError(''); setLoading(true); load(); }} className="underline font-medium">Réessayer</button>
        </Alert>
      </div>
    );
  }
  if (!conversation) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[320px]">
      <div className="mb-4 flex items-center gap-4">
        <Link href="/admin/discussions" className="text-urbans-warm/80 hover:text-urbans-noir transition-colors">← Discussions</Link>
        <h1 className="page-title-sm">Discussion avec {conversation.prenom} {conversation.nom}</h1>
      </div>
      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="card flex-1 flex flex-col min-h-0 p-4">
        <p className="text-xs text-urbans-warm/70 mb-2">{conversation.email}</p>
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.length === 0 && <p className="text-urbans-warm/60 text-sm">Aucun message. Envoyez le premier.</p>}
          {messages.map((m) => (
            <div
              key={m.message_id}
              className={`flex ${m.from_admin ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${m.from_admin ? 'bg-urbans-gold/20 text-urbans-noir' : 'bg-urbans-sand text-urbans-noir'}`}>
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                <p className="text-[10px] mt-1 opacity-70">{new Date(m.created_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="flex gap-2">
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
