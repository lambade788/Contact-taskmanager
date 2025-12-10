// app/tasks/page.tsx
'use client';

import React, { useEffect, useState, useCallback, CSSProperties } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProtectedLayout from '@/components/ProtectedLayout';
import api from '@/lib/api';
import TaskForm from '@/components/TaskForm'; 

// --- TYPE DEFINITIONS ---
type Task = { id: number; title: string; description?: string; status: string; due_date?: string; contact_id?: number; contact_name?: string; };
type Contact = { id: number; contact_full_name?: string; contact_first_name?: string; contact_last_name?: string; contact_number: string; contact_email?: string; note?: string; addresses: any[]; tasks: any[]; };
// -----------------------------------------------------------------


export default function TasksPage() {
    const router = useRouter(); 
    const searchParams = useSearchParams();
    const contactIdFromUrl = searchParams.get('contactId');

    const [tasks, setTasks] = useState<Task[]>([]);
    const [allTasks, setAllTasks] = useState<Task[]>([]); 
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [formKey, setFormKey] = useState(0); 
    const [creating, setCreating] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    // Load function now fetches all data and stores it
    const load = async () => {
        setLoading(true);
        setMessage('');
        try {
            const [tRes, cRes] = await Promise.all([api.get('/api/tasks'), api.get('/api/contacts')]);

            const fetchedTasks = Array.isArray(tRes.data) ? (tRes.data as Task[]) : [];
            const fetchedContacts = Array.isArray(cRes.data) ? (cRes.data as Contact[]) : [];
            
            setAllTasks(fetchedTasks);
            setContacts(fetchedContacts);
        } catch (err: any) {
            console.error('Load tasks error', err);
            setMessage('Could not load tasks');
            setAllTasks([]);
            setContacts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const targetContactId = contactIdFromUrl ? Number(contactIdFromUrl) : null;
        if (targetContactId) {
            const filteredTasks = allTasks.filter(task => task.contact_id === targetContactId);
            setTasks(filteredTasks);
            if (!creating) {
                setCreating(true);
                setFormKey(prev => prev + 1);
            }
        } else {
            setTasks(allTasks);
        }
    }, [allTasks, contactIdFromUrl, creating]); 

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleToggleForm = useCallback(() => {
        if (creating) {
            setFormKey(prev => prev + 1);
        }
        setCreating(p => !p);
    }, [creating]);


    const create = async (data: any) => {
        setMessage('');
        try {
          await api.post('/api/tasks', data);
          
          setCreating(false);
          setMessage('Task created');
          setFormKey(prev => prev + 1); 
          
          await load(); // Reload all data to update both lists
        } catch (err: any) {
          console.error('Create task error', err);
          setMessage(err?.response?.data?.error || 'Create failed');
        }
    };
    
    const remove = async (id: number) => {
        setMessage('');
        const ok = typeof window !== 'undefined' ? window.confirm('Delete task?') : true;
        if (!ok) return;
        try {
          await api.delete(`/api/tasks/${id}`);
          setMessage('Deleted');
          await load();
        } catch (err: any) {
          console.error('Delete task error', err);
          setMessage('Delete failed');
        }
    };

    /**
     * @description New function to mark a task as completed.
     */
    const markComplete = async (id: number) => {
        setMessage('');
        try {
            // Use the PUT route to update status only. Backend handles merging.
            await api.put(`/api/tasks/${id}`, { status: 'completed' }); 
            
            setMessage('Task marked as completed! ✅');
            await load(); // Reload all data to show the updated status
        } catch (err: any) {
            console.error('Mark complete error', err);
            setMessage('Failed to mark task complete');
        }
    };

    // Prepare initial data: pre-select the contact if a contactId is in the URL
    const initialData = contactIdFromUrl 
        ? { contact_id: Number(contactIdFromUrl) } 
        : {};
        
    // Find the contact name for the title
    const currentContact = contacts.find(c => c.id === Number(contactIdFromUrl));
    const pageTitle = currentContact 
        ? `Tasks for ${currentContact.contact_full_name || `${currentContact.contact_first_name} ${currentContact.contact_last_name}`}`
        : 'All Tasks';


    // 🎨 ORANGE/BLACK THEME STYLES 🎨
    const PRIMARY_ACCENT = '#FF4700'; // Vibrant Orange/Red
    const BUTTON_GRADIENT = 'linear-gradient(to right, #FF4700, #FF7B40)'; // Orange/Red Gradient
    const BACKGROUND_WHITE = '#FFFFFF';
    const LIGHT_CARD_BG = '#F0F0F0'; 
    const BORDER_COLOR = '#EAEAEA'; 
    const TEXT_COLOR = '#212529'; 
    const SECONDARY_TEXT_COLOR = '#495057'; 
    

    const baseButtonStyle: CSSProperties = {
        padding: '10px 15px', 
        color: BACKGROUND_WHITE, 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'opacity 0.2s, transform 0.1s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    };

    const primaryActionButtonStyle: CSSProperties = {
        ...baseButtonStyle,
        background: BUTTON_GRADIENT,
        boxShadow: '0 4px 8px rgba(255, 71, 0, 0.3)',
    };
    
    const secondaryActionButtonStyle: CSSProperties = {
        ...baseButtonStyle,
        backgroundColor: BACKGROUND_WHITE,
        color: SECONDARY_TEXT_COLOR,
        border: `1px solid ${BORDER_COLOR}`,
        boxShadow: 'none',
    };

    const backButtonStyle: CSSProperties = {
        ...secondaryActionButtonStyle,
        marginRight: '15px' // Space from next button
    };

    const deleteButtonStyle: CSSProperties = {
        ...baseButtonStyle,
        backgroundColor: '#dc3545', // Use red for delete
        borderColor: '#dc3545',
        padding: '6px 12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    };
    
    /**
     * @description New style for the Mark Complete button.
     */
    const completeButtonStyle: CSSProperties = {
        ...baseButtonStyle,
        backgroundColor: '#28A745', // Green color
        borderColor: '#28A745',
        padding: '6px 12px',
        marginRight: '10px', // Space between Mark Complete and Delete buttons
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    };
    
    const taskListItemStyle: CSSProperties = {
        border: `1px solid ${BORDER_COLOR}`, 
        backgroundColor: BACKGROUND_WHITE, 
        marginBottom: '15px', // Increased spacing
        padding: '20px', // Increased padding
        borderRadius: '8px', // More rounded corners
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
    }
    
    const messageStyle: CSSProperties = {
        color: '#155724', 
        marginBottom: 20, 
        padding: 12, 
        backgroundColor: '#d4edda', 
        border: '1px solid #c3e6cb', 
        borderRadius: '6px',
        fontWeight: 500,
    }

    const formContainerStyle: CSSProperties = {
        marginBottom: 30, 
        padding: 25, 
        border: `1px solid ${BORDER_COLOR}`, 
        borderRadius: '8px', 
        backgroundColor: LIGHT_CARD_BG, 
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
    }


    return (
        <ProtectedLayout style={{backgroundColor: BACKGROUND_WHITE, color: TEXT_COLOR}}>
          <div style={{padding: '30px'}}>
            {/* Page Title */}
            <h2 style={{
                color: TEXT_COLOR, 
                borderBottom: `4px solid ${PRIMARY_ACCENT}`, 
                paddingBottom: 10, 
                marginBottom: 25,
                fontWeight: 800,
                fontSize: '2.5em'
            }}>
                {pageTitle}
            </h2> 

            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center' }}>
                {/* Back Button (Secondary Style) */}
                <button 
                    onClick={() => router.push('/dashboard')} 
                    style={backButtonStyle}
                >
                    ⬅️ Back to Dashboard
                </button>
                
                {/* Add/Cancel Button (Primary Orange Style) */}
                <button 
                    onClick={handleToggleForm} 
                    style={creating ? secondaryActionButtonStyle : primaryActionButtonStyle}
                >
                    {creating ? (
                        <><span style={{ color: SECONDARY_TEXT_COLOR, marginRight: 8 }}>❌</span> Cancel</>
                    ) : (
                        <><span style={{ marginRight: 8 }}>➕</span> Add Task</>
                    )}
                </button>
            </div>

            {message && <div style={messageStyle}>{message}</div>}

            {creating && (
                <div style={formContainerStyle}>
                    <h3 style={{ 
                            marginTop: 0, 
                            color: TEXT_COLOR, 
                            borderBottom: `2px solid ${PRIMARY_ACCENT}`, 
                            paddingBottom: 10 
                        }}>
                            Create Task
                        </h3>
                    <TaskForm 
                        key={formKey} 
                        contacts={contacts} 
                        onSubmit={create} 
                        onCancel={handleToggleForm} 
                        initial={initialData} 
                        isLightTheme={true} 
                    />
                </div>
            )}

            {loading ? (
              <div style={{color: PRIMARY_ACCENT}}>Loading tasks...</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {tasks.map((t) => (
                  <li key={t.id} style={taskListItemStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{color: PRIMARY_ACCENT, fontSize: '1.2em'}}>{t.title}</strong>
                        <div style={{ marginTop: 6, color: SECONDARY_TEXT_COLOR }}>{t.description}</div>
                        <div style={{ marginTop: 8, fontSize: 13, color: SECONDARY_TEXT_COLOR }}>
                          Status: <span style={{fontWeight: 600, color: t.status === 'pending' ? '#FFC107' : (t.status === 'completed' ? '#28A745' : '#17A2B8')}}>{t.status || 'pending'}</span> | 
                            Due: {t.due_date ?? '—'}
                        </div>
                        {t.contact_name && <div style={{ marginTop: 6, fontSize: 13, color: PRIMARY_ACCENT, fontWeight: 600 }}>Associated Contact: {t.contact_name}</div>}
                      </div>

                      {/* ACTION BUTTONS (Updated to include Mark Complete) */}
                      <div style={{ display: 'flex' }}>
                        {/* 1. Mark Complete Button (Only show if task is not 'completed') */}
                        {t.status !== 'completed' && (
                            <button 
                                onClick={() => markComplete(t.id)} 
                                style={completeButtonStyle}
                            >
                                ✅ Mark Complete
                            </button>
                        )}

                        {/* 2. Delete Button */}
                        <button onClick={() => remove(t.id)} style={deleteButtonStyle}>🗑️ Delete</button>
                      </div>
                    </div>
                  </li>
                ))}

                {tasks.length === 0 && <li style={{ padding: 20, color: SECONDARY_TEXT_COLOR, border: `1px dashed ${BORDER_COLOR}`, borderRadius: '6px', backgroundColor: LIGHT_CARD_BG }}>No tasks found for this view.</li>}
              </ul>
            )}
          </div>
        </ProtectedLayout>
    );
}