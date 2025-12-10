// app/contacts/page.tsx
'use client';
import React, { useEffect, useState, useCallback } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import api from '@/lib/api';
import ContactForm from '@/components/ContactForm';

// --- TYPE DEFINITION ---
type Contact = {
  id: number;
  contact_full_name?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_number?: string;
  contact_email?: string; 
  address_line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  note?: string;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [message, setMessage] = useState<string>('');

  // normalize response -> always return an array
  const normalizeContacts = (data: any): Contact[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    // common shape: { contacts: [...] } or { data: [...] }
    if (Array.isArray(data.contacts)) return data.contacts;
    if (Array.isArray(data.data)) return data.data;
    // if it's an object keyed by id, convert to array
    if (typeof data === 'object') return Object.values(data) as Contact[];
    return [];
  };

  const load = useCallback(async (opts?: { signal?: AbortSignal }) => {
    setLoading(true);
    try {
      const res = await api.get('/api/contacts', { signal: opts?.signal } as any);
      const list = normalizeContacts(res.data);
      setContacts(list);
      setMessage(''); // clear previous errors on success
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.message === 'canceled') {
        // request aborted — ignore
      } else {
        setMessage(err?.response?.data?.error || 'Could not load contacts');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load({ signal: controller.signal });
    return () => controller.abort();
  }, [load]);

  const create = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/api/contacts', data);
      setShowAdd(false);
      setMessage('Contact created');
      await load();
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: number, data: any) => {
    setLoading(true);
    try {
      await api.put(`/api/contacts/${id}`, data);
      setEditing(null);
      setMessage('Contact updated');
      await load();
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this contact?')) return;
    setLoading(true);
    try {
      await api.delete(`/api/contacts/${id}`);
      setMessage('Deleted');
      await load();
    } catch (err: any) {
      setMessage('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Uses the dedicated /api/addresses endpoint instead of a nested one
  const addAddress = async (id: number) => {
    const address_line1 = prompt('Address line 1 (required)');
    const city = prompt('City (required)');
    if (!address_line1 || !city) return alert('Address line 1 and City are required');
    
    setLoading(true);
    try {
        // Post to the dedicated /api/addresses endpoint with contact_id and data
        await api.post('/api/addresses', { contact_id: id, address_line1, city });
        setMessage('Address added');
        await load();
    } catch (err: any) {
        setMessage('Add address failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <ProtectedLayout>
      <div>
        <h2>Contacts</h2>

        <div style={{ marginBottom: 12 }}>
          <button onClick={() => { setShowAdd(!showAdd); setEditing(null); }}>
            {showAdd ? 'Cancel' : 'Add Contact'}
          </button>
        </div>

        {message && <div style={{ color: 'green', marginBottom: 8 }}>{message}</div>}

        {showAdd && <ContactForm onSubmit={create} onCancel={() => setShowAdd(false)} />}

        {loading ? <div>Loading...</div> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {contacts.map((c) => (
              <li key={c.id} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{c.contact_full_name || `${c.contact_first_name ?? ''} ${c.contact_last_name ?? ''}`.trim()}</strong>
                    <div>{c.contact_number}</div>
                    {c.address_line1 && <div style={{ fontSize: 13, color: '#000000' }}>{c.address_line1}, {c.city} {c.state} {c.pincode}</div>}
                    {c.note && <div style={{ fontSize: 13 }}>{c.note}</div>}
                  </div>
                  <div>
                    <button onClick={() => { setEditing(c); setShowAdd(false); }}>Edit</button>
                    <button onClick={() => remove(c.id)} style={{ marginLeft: 6 }}>Delete</button>
                    <button onClick={() => addAddress(c.id)} style={{ marginLeft: 6 }}>Add Address</button>
                  </div>
                </div>

                {editing?.id === c.id && (
                  <ContactForm
                    initial={editing!} // ✅ FIXED: Non-null assertion (!) to resolve the TypeScript error
                    onSubmit={(data) => update(c.id, data)}
                    onCancel={() => setEditing(null)}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </ProtectedLayout>
  );
}