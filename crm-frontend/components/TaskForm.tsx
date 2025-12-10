// components/TaskForm.tsx

import React, { useState, FormEvent, CSSProperties } from 'react';

// --- TYPE DEFINITIONS ---
type Contact = { id: number; contact_full_name?: string; contact_first_name?: string; contact_last_name?: string; };
type TaskFormProps = {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    contacts: Contact[];
    initial?: { title?: string; description?: string; contact_id?: number; due_date?: string; status?: string; };
    isLightTheme?: boolean; 
};
// ------------------------

// Helper functions for date splitting and formatting
const splitDate = (dateString: string) => {
    if (!dateString) return { year: '', month: '', day: '' };
    const [year, month, day] = dateString.split('-');
    return { year: year || '', month: month || '', day: day || '' };
};

// Generate list of days (1 to 31)
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
// Month mapping (01 to 12)
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
// Generate years (e.g., current year to 5 years from now)
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => String(CURRENT_YEAR + i - 1)); // -1 to +9 years

export default function TaskForm({ onSubmit, onCancel, contacts, initial = {}, isLightTheme = true }: TaskFormProps) {
    const initialDateParts = splitDate(initial.due_date || '');
    
    const [title, setTitle] = useState(initial.title || '');
    const [description, setDescription] = useState(initial.description || '');
    const [contactId, setContactId] = useState(initial.contact_id?.toString() || '');
    
    // 💡 NEW STATE FOR DAY, MONTH, YEAR SELECTION
    const [dueDay, setDueDay] = useState(initialDateParts.day);
    const [dueMonth, setDueMonth] = useState(initialDateParts.month);
    const [dueYear, setDueYear] = useState(initialDateParts.year);

    const [status, setStatus] = useState(initial.status || 'pending');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Title is required.');
            return;
        }

        let formattedDueDate = null;
        if (dueYear && dueMonth && dueDay) {
            // Combine selected parts into 'YYYY-MM-DD' format for the API
            formattedDueDate = `${dueYear}-${dueMonth}-${dueDay}`;
        }
        
        const data = {
            title,
            description: description.trim() || null,
            contact_id: contactId ? Number(contactId) : null,
            due_date: formattedDueDate, // 💡 Using the combined date string
            status,
        };
        onSubmit(data);
    };
    
    // 🎨 ORANGE/BLACK THEME STYLES (Kept consistent) 🎨
    const PRIMARY_ACCENT = '#FF4700'; 
    const BUTTON_GRADIENT = 'linear-gradient(to right, #FF4700, #FF7B40)';
    const BORDER_COLOR = '#EAEAEA';
    const TEXT_COLOR = '#212529'; 
    const SECONDARY_TEXT_COLOR = '#495057';

    const baseInputStyle: CSSProperties = {
        padding: '10px',
        marginBottom: '15px',
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: '6px',
        width: '100%',
        backgroundColor: '#ffffff',
        color: TEXT_COLOR, 
        boxSizing: 'border-box',
    };
    
    const labelStyle: CSSProperties = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: '600',
        color: TEXT_COLOR
    };
    
    const baseButtonStyle: CSSProperties = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.2s',
        marginRight: '15px',
        display: 'flex',
        alignItems: 'center',
    };
    
    const primaryButtonStyle: CSSProperties = {
        ...baseButtonStyle,
        background: BUTTON_GRADIENT,
        color: 'white',
        boxShadow: '0 4px 8px rgba(255, 71, 0, 0.3)',
    };

    const secondaryButtonStyle: CSSProperties = {
        ...baseButtonStyle,
        backgroundColor: SECONDARY_TEXT_COLOR,
        color: 'white',
        marginRight: '0',
    };

    return (
        <form onSubmit={handleSubmit} style={{ margin: '0', padding: '0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Title */}
                <div>
                    <label htmlFor="title" style={labelStyle}>Title</label>
                    <input 
                        id="title"
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        style={baseInputStyle}
                        required
                    />
                </div>
                
                {/* Due Date Selectors (Day, Month, Year) */}
                <div>
                    <label style={labelStyle}>Due date (Day / Month / Year)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                        {/* Day Selector */}
                        <select 
                            id="dueDay"
                            value={dueDay} 
                            onChange={(e) => setDueDay(e.target.value)} 
                            style={baseInputStyle}
                        >
                            <option value="">Day</option>
                            {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                        
                        {/* Month Selector */}
                        <select 
                            id="dueMonth"
                            value={dueMonth} 
                            onChange={(e) => setDueMonth(e.target.value)} 
                            style={baseInputStyle}
                        >
                            <option value="">Month</option>
                            {MONTHS.map(month => <option key={month} value={month}>{month}</option>)}
                        </select>

                        {/* Year Selector */}
                        <select 
                            id="dueYear"
                            value={dueYear} 
                            onChange={(e) => setDueYear(e.target.value)} 
                            style={baseInputStyle}
                        >
                            <option value="">Year</option>
                            {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" style={labelStyle}>Description</label>
                <textarea 
                    id="description"
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    style={{...baseInputStyle, minHeight: '80px'}}
                />
            </div>

            {/* Contact and Status in a row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Contact */}
                <div>
                    <label htmlFor="contact" style={labelStyle}>Contact (optional)</label>
                    <select 
                        id="contact"
                        value={contactId} 
                        onChange={(e) => setContactId(e.target.value)} 
                        style={baseInputStyle}
                    >
                        <option value="">-- none --</option>
                        {contacts.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.contact_full_name || `${c.contact_first_name} ${c.contact_last_name}`.trim()}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Status */}
                <div>
                    <label htmlFor="status" style={labelStyle}>Status</label>
                    <select 
                        id="status"
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)} 
                        style={baseInputStyle}
                    >
                        <option value="pending">Pending</option>
                        <option value="complete">Complete</option>
                    </select>
                </div>
            </div>

            {/* Buttons */}
            <div style={{ marginTop: '30px', borderTop: `1px solid ${BORDER_COLOR}`, paddingTop: '20px' }}>
                <button type="submit" style={primaryButtonStyle}>
                    <span style={{ marginRight: 8 }}>💾</span> Save Task
                </button>
                <button type="button" onClick={onCancel} style={secondaryButtonStyle}>
                    <span style={{ marginRight: 8 }}>❌</span> Cancel
                </button>
            </div>
        </form>
    );
}