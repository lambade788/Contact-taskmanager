'use client';
import React, { useEffect, useState, useCallback, CSSProperties } from 'react'; 
import { useRouter } from 'next/navigation'; 
import ProtectedLayout from '@/components/ProtectedLayout';
import api from '@/lib/api';
import ContactForm from '@/components/ContactForm'; 
import AddressForm from '@/components/AddressForm'; // 🌟 Ensure this component exists!

// --- TYPE DEFINITIONS ---
type Task = {
    id: number;
    title: string;
    description?: string;
    status: string; 
    due_date?: string;
};

type Address = {
    id: number;
    contact_id: number;
    address_line1: string;
    address_line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
};

type Contact = {
    id: number;
    contact_full_name?: string;
    contact_first_name?: string;
    contact_last_name?: string;
    contact_number: string; 
    contact_email?: string;
    note?: string;
    addresses: Address[]; 
    tasks: Task[]; 
};

// ------------------------------------

export default function DashboardPage() {
    // --- STATE HOOKS ---
    const router = useRouter(); 
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAdd, setShowAdd] = useState(false); 
    const [message, setMessage] = useState<string>('');
    const [formKey, setFormKey] = useState(0); 
    const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
    
    // 🌟 NEW STATE for Address Management
    const [contactIdToAddAddress, setContactIdToAddAddress] = useState<number | null>(null);
    
    // Helper state to check if any form is visible
    const isContactFormVisible = showAdd || !!contactToEdit;
    const isAnyFormVisible = isContactFormVisible || !!contactIdToAddAddress;
    
    // --- API/Logic functions ---
   const load = useCallback(async (opts?: { signal?: AbortSignal }) => { 
    setLoading(true);
    setMessage('');
    try {
        // The fix: Cast the configuration object { signal: ... } as any 
        // to satisfy TypeScript's strict requirements for generic API calls.
        const res = await api.get('/api/contacts', { signal: opts?.signal } as any);
        
        // Ensure you handle the response data correctly:
        // (Assuming setContacts is typed to accept Contact[])
        setContacts(Array.isArray(res.data) ? res.data as Contact[] : []);
        setMessage('Contacts loaded successfully.');
        
    } catch (err: any) {
        console.error('Load contacts error', err);
        setMessage(err?.response?.data?.error || 'Load Failed: Server error');
    } finally {
        setLoading(false);
    }
}, []);

    useEffect(() => {
        const controller = new AbortController();
        load({ signal: controller.signal });
        return () => controller.abort();
    }, [load]);

    const createOrUpdate = async (data: any) => { 
        setMessage('');
        try {
            if (contactToEdit) {
                await api.put(`/api/contacts/${contactToEdit.id}`, data);
                setMessage('Contact updated.');
            } else {
                await api.post('/api/contacts', data);
                setMessage('Contact created.');
            }
            setShowAdd(false);
            setContactToEdit(null);
            setFormKey(prev => prev + 1); 
            await load(); 
        } catch (err: any) {
            console.error('Create/Update error', err);
            setMessage(err?.response?.data?.error || 'Operation failed.');
        }
    };
    
    const handleEdit = useCallback((contact: Contact) => { 
        // Close address form if open
        setContactIdToAddAddress(null);
        setContactToEdit(contact); 
        setShowAdd(false); 
        setFormKey(prev => prev + 1); 
    }, []);

    const handleToggleContactForm = () => { 
        // Close address form if open
        setContactIdToAddAddress(null);
        if (isContactFormVisible) {
            setFormKey(prev => prev + 1);
        }
        setShowAdd(p => !p); 
        setContactToEdit(null);
    };
    
    const handleAddTask = (contactId: number) => { 
        router.push(`/tasks?contactId=${contactId}`);
    }
    
    const remove = async (id: number) => { 
        setMessage('');
        const ok = typeof window !== 'undefined' ? window.confirm('Delete contact?') : true;
        if (!ok) return;
        try {
            await api.delete(`/api/contacts/${id}`);
            setMessage('Deleted');
            await load();
        } catch (err: any) {
            console.error('Delete error', err);
            setMessage('Delete failed');
        }
    };

    // In app/dashboard/page.tsx, near the top buttons section

const simulateEmailLog = async () => {
    setMessage('');
    try {
        const emailDetails = {
            to_email: 'supervisor@upskill.com', // The email that would receive the message
            subject: 'Task Reminder: Rahul Lambade overdue', // The email subject
            body: `Dear Supervisor, Task 'Call Rahul' is overdue and requires attention.`, // The email body
        };

        // 1. Make the POST request to your backend route
        await api.post('/api/email/send', emailDetails); 
        
        // 2. Alert the user to check the database
        setMessage('Email log successful! Please check the MySQL email_logs table for the new entry. 📧');
    } catch (err: any) {
        console.error('Simulate email error:', err);
        setMessage(err?.response?.data?.error || 'Failed to simulate email log.');
    }
};



    // 🌟 ADDED FUNCTION: Mark Task Complete 🌟
        const markTaskComplete = async (taskId: number, contactId: number) => {
            setMessage('');
            try {
                // API call to update the task status
                await api.put(`/api/tasks/${taskId}`, { status: 'completed' }); 
                
                // Optimistically update the single contact's tasks in the UI
                setContacts(prevContacts => 
                    prevContacts.map(c => 
                        c.id === contactId
                            ? {
                                ...c,
                                tasks: c.tasks.map(t => 
                                    t.id === taskId ? { ...t, status: 'completed' } : t
                                )
                            }
                            : c
                    )
                );
                
                setMessage('Task marked as completed! ✅');
                // Reload contacts after a small delay to ensure all data is consistent
                setTimeout(() => load(), 500); 
    
            } catch (err: any) {
                console.error('Mark complete error', err);
                setMessage('Failed to mark task complete');
            }
        };
        // -------------------------------------------------------------

    // 🌟 NEW HANDLERS FOR ADDRESS FORM
    const handleAddAddress = (contactId: number) => { 
        // Close other forms before opening the address form
        setShowAdd(false);
        setContactToEdit(null);
        setContactIdToAddAddress(contactId);
    };
    
    const handleAddressFormClose = () => {
        setContactIdToAddAddress(null);
        setMessage('Address operation completed. Refreshing contacts...');
        load(); // Reload contacts to see the new address
    }
    // -------------------------------------------------------------
    
    // 🎨 STYLES: WHITE BACKGROUND, BLACK TEXT, ORANGE ACCENT 🎨
    // -------------------------------------------------------------
    
    const PRIMARY_ACCENT = '#FF4700'; 
    const BUTTON_GRADIENT = 'linear-gradient(to right, #FF4700, #FF7B40)';
    const BACKGROUND_WHITE = '#FFFFFF';
    const LIGHT_CARD_BG = '#F5F5F5';
    const BORDER_COLOR = '#CCCCCC'; 
    const TEXT_COLOR = '#212529'; 
    const SECONDARY_TEXT_COLOR = '#495057'; 

    const secondaryButtonStyle: CSSProperties = {
        padding: '10px 15px', 
        fontSize: '14px', 
        borderRadius: '6px', 
        cursor: 'pointer',
        border: `1px solid ${BORDER_COLOR}`,
        fontWeight: 600, 
        whiteSpace: 'nowrap',
        backgroundColor: BACKGROUND_WHITE,
        color: SECONDARY_TEXT_COLOR,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'background-color 0.2s ease',
        display: 'flex',
        alignItems: 'center',
    };

    const primaryActionButtonStyle: CSSProperties = {
        padding: '10px 20px', 
        background: BUTTON_GRADIENT, 
        color: BACKGROUND_WHITE, 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer',
        fontWeight: 700,
        boxShadow: '0 4px 8px rgba(255, 71, 0, 0.3)',
        transition: 'opacity 0.2s, transform 0.1s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };``

    const utilityButtonStyle: CSSProperties = {
        padding: '8px 10px',
        fontSize: '14px', 
        borderRadius: '4px', 
        cursor: 'pointer',
        border: `1px solid ${BORDER_COLOR}`,
        fontWeight: 500,
        backgroundColor: BACKGROUND_WHITE,
        color: SECONDARY_TEXT_COLOR,
        width: '100%', 
        textAlign: 'left',
        boxShadow: 'none', 
    };

    const contactCardStyle: CSSProperties = {
        border: `1px solid ${BORDER_COLOR}`, 
        padding: 20, 
        backgroundColor: LIGHT_CARD_BG, 
        marginBottom: 18, 
        borderRadius: '8px', 
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)' 
    };


      // 🌟 ADDED STYLE: Task Completion Button (Green)
    const taskCompleteButtonStyle: CSSProperties = {
        padding: '4px 8px',
        fontSize: '12px', 
        borderRadius: '4px', 
        cursor: 'pointer',
        fontWeight: 600,
        backgroundColor: '#28A745', // Green color
        color: BACKGROUND_WHITE,
        border: 'none',
        marginLeft: '10px',
        flexShrink: 0,
        whiteSpace: 'nowrap',
    };
    // ---------------------------------------------

    return (
        <ProtectedLayout style={{backgroundColor: BACKGROUND_WHITE, color: TEXT_COLOR}}>
            <div style={{ padding: '20px' }}>
                <h2 style={{ 
                    borderBottom: `4px solid ${PRIMARY_ACCENT}`, 
                    paddingBottom: 10, 
                    marginBottom: 25, 
                    color: TEXT_COLOR, 
                    fontWeight: 800,
                    fontSize: '2em'
                }}>
                    Dashboard (Contact and Task Managment)
                </h2>
                
                <div style={{ marginBottom: 25, display: 'flex', gap: 15, alignItems: 'center' }}>
                    
                    {/* Refresh Contacts Button */}
                    <button onClick={() => load()} style={secondaryButtonStyle}> 
                        <span style={{ color: PRIMARY_ACCENT, marginRight: 5 }}>🔄</span> Refresh Contacts load
                    </button> 
                    
                    {/* Cancel Contact Button (Only visible when a contact form is open) */}
                    {isContactFormVisible && (
                        <button onClick={handleToggleContactForm} style={secondaryButtonStyle}>
                            <span style={{ color: PRIMARY_ACCENT, marginRight: 5 }}>❌</span> Cancel Contact
                        </button>
                    )}
                    
                    {/* Cancel Address Button (Only visible when address form is open) */}
                    {contactIdToAddAddress !== null && (
                        <button onClick={handleAddressFormClose} style={secondaryButtonStyle}>
                            <span style={{ color: PRIMARY_ACCENT, marginRight: 5 }}>❌</span> Cancel Address
                        </button>
                    )}

                    {/* Create New Contact Button (Primary Orange Gradient) */}
                    <button onClick={handleToggleContactForm} style={{
                        ...primaryActionButtonStyle, 
                        // Hide if any form is visible
                        display: isAnyFormVisible ? 'none' : 'flex',
                        marginLeft: 'auto', 
                    }}>
                        <span style={{ marginRight: 5 }}>➕</span> Create New Contact
                    </button>
                    

                    <button 
                       onClick={simulateEmailLog} 
                           style={{
                           ...primaryActionButtonStyle, // Use your existing style for consistency
                            backgroundColor: '#007bff', // Give it a unique color like blue
                             marginLeft: 15,
                            width: 'auto',
                            padding: '10px 15px'
                                 }}
                                   >
                                 ⚡ Simulate Email Log
                     </button>
                    {/* Message Display */}
                    {message && <div style={{ 
                        color: PRIMARY_ACCENT, 
                        fontWeight: 500,
                        marginLeft: isAnyFormVisible ? 'auto' : 20,
                        marginRight: isAnyFormVisible ? 0 : 'auto',
                    }}>{message}</div>}

                </div>

                
                {/* Create/Edit Contact Form */}
                {isContactFormVisible && (
                    <div key={formKey} style={{ 
                        padding: 25, 
                        border: `1px solid ${BORDER_COLOR}`, 
                        marginBottom: 30, 
                        backgroundColor: LIGHT_CARD_BG, 
                        borderRadius: '10px', 
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)' 
                    }}>
                        <h3 style={{ marginTop: 0, color: TEXT_COLOR, borderBottom: `2px solid ${PRIMARY_ACCENT}`, paddingBottom: 10 }}>{contactToEdit ? ' Edit Contact' : ' New Contact'}</h3>
                        <ContactForm 
                            onSubmit={createOrUpdate}
                            onCancel={handleToggleContactForm} 
                            initial={contactToEdit || {}}
                            isLightTheme={true} 
                        />
                    </div>
                )}
                
                {/* 🌟 ADD ADDRESS FORM INTEGRATION 🌟 */}
                {contactIdToAddAddress !== null && (
                    <div style={{ 
                        padding: 25, 
                        border: `1px solid ${BORDER_COLOR}`, 
                        marginBottom: 30, 
                        backgroundColor: LIGHT_CARD_BG, 
                        borderRadius: '10px', 
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)' 
                    }}>
                        <h3 style={{ marginTop: 0, color: TEXT_COLOR, borderBottom: `2px solid ${PRIMARY_ACCENT}`, paddingBottom: 10 }}>Add New Address</h3>
                        <AddressForm 
                            contactId={contactIdToAddAddress} 
                            onSuccess={handleAddressFormClose} 
                            onCancel={handleAddressFormClose} 
                        />
                    </div>
                )}
                
                {/* Contact List */}
                {loading ? <div style={{ color: PRIMARY_ACCENT }}>Loading contacts...</div> : (
                    contacts.length === 0 ? (
                        <div style={{ color: SECONDARY_TEXT_COLOR, marginTop: 20, padding: 20, border: `1px dashed ${BORDER_COLOR}`, borderRadius: '6px' }}>No contacts found. Click 'Create New Contact' to begin.</div>
                    ) : (
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: 20 }}>
                        {contacts.map((c) => (
                            <li key={c.id} style={contactCardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    
                                    {/* MAIN CONTACT DETAILS */}
                                    <div style={{ flexGrow: 1, marginRight: 30 }}>
                                    
                                        <strong style={{ 
                                            fontSize: '1.4em', 
                                            color: TEXT_COLOR, 
                                            whiteSpace: 'nowrap',
                                            paddingBottom: '5px',
                                            borderBottom: `1px solid ${BORDER_COLOR}`
                                        }}>
                                            {c.contact_full_name || `${c.contact_first_name ?? ''} ${c.contact_last_name ?? ''}`.trim()}
                                        </strong>

                                        <div style={{ color: TEXT_COLOR, marginTop: 8 }}>📞 Phone: {c.contact_number}</div>
                                        {c.contact_email && <div style={{ color: TEXT_COLOR }}>📧 Email: {c.contact_email}</div>}
                                        {c.note && <div style={{ fontSize: 14, color: PRIMARY_ACCENT, marginTop: 8 }}>📌 Note: {c.note}</div>}
                                    </div>
                                    
                                    {/* Buttons Container */}
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'flex-start',  
                                        gap: '6px', 
                                        flexShrink: 0,
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)', 
                                        width: '180px'
                                    }}>
                                        <button onClick={() => handleEdit(c)} style={utilityButtonStyle}>Edit Contact</button>
                                        <button onClick={() => remove(c.id)} style={utilityButtonStyle}>Delete Contact</button>
                                        <button onClick={() => handleAddAddress(c.id)} style={utilityButtonStyle}>Add Address</button> {/* 🌟 UPDATED */}
                                        <button onClick={() => handleAddTask(c.id)} style={utilityButtonStyle}>Create Task</button>
                                    </div>
                                </div>
                                
                                {/* Addresses List (Rendered below) */}
                                {c.addresses && c.addresses.length > 0 && (
                                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BORDER_COLOR}` }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: TEXT_COLOR, fontSize: '1em' }}>🏡 Addresses ({c.addresses.length}):</h4>
                                        {c.addresses.map(address => (
                                            <div key={address.id} style={{ 
                                                fontSize: 14, 
                                                padding: 10, 
                                                borderLeft: `4px solid ${PRIMARY_ACCENT}`, 
                                                marginLeft: 5, 
                                                marginBottom: 8,
                                                backgroundColor: '#f3edebff', 
                                                borderRadius: '4px',
                                                color: 'black'
                                            }}>
                                                {address.address_line1}, {address.city}, {address.state} {address.pincode}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                
                                {/* Tasks List (Rendered below) */}
                                {c.tasks && c.tasks.length > 0 && (
                                    <div style={{ marginTop: 15, paddingTop: 10, borderTop: `1px solid ${BORDER_COLOR}` }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: TEXT_COLOR, fontSize: '1em' }}>✅ Tasks ({c.tasks.length}):</h4>
                                        {c.tasks.map(task => (
                                            // The outer div remains, but we add flex properties for internal alignment
                                            <div key={task.id} style={{ 
                                                fontSize: 14, 
                                                padding: 10, 
                                                // Border color based on status (black/pending yellow)
                                                borderLeft: task.status === 'pending' ? '4px solid #FFC107' : '4px solid #000000ff', 
                                                marginLeft: 5,
                                                marginBottom: 8,
                                                backgroundColor: '#ffffffff',
                                                borderRadius: '4px',
                                                color: 'black',
                                            // 🌟 Layout Fix: Use flex properties here
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            }}>
                                                
                                            {/* Task Details Wrapper - ensures details stay together */}
                                            <div style={{ flexGrow: 1 }}>
                                                <strong style={{ color: TEXT_COLOR }}>{task.title}</strong> 
                                                <span style={{ fontSize: 13, color: SECONDARY_TEXT_COLOR, marginLeft: 10 }}>
                                                    (Due: {task.due_date} | Status: <span style={{ fontWeight: 600, color: task.status === 'pending' ? '#FFC107' : '#000000ff' }}>{task.status}</span>)
                                                </span>
                                            </div>
                                            
                                            {/* Mark Complete Button (Only show if pending) */}
                                            {task.status === 'pending' && (
                                                <button 
                                                    onClick={() => markTaskComplete(task.id, c.id)} 
                                                    style={taskCompleteButtonStyle}
                                                >
                                                    ✅ Complete
                                                </button>
                                            )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    )
                )}
            </div>
        </ProtectedLayout>
    );
}