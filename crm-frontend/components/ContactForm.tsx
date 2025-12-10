
'use client';

import React, { useState } from 'react';

// Define the shape of the data submitted by the form
type ContactFormData = {
    contact_first_name: string;
    contact_last_name: string;
    contact_number: string;
    contact_email: string;
    note: string;
};

// Define props for the component
type ContactFormProps = {
    onSubmit: (data: ContactFormData) => void;
    onCancel: () => void;
    // Optional prop for initial data if you were doing an "Edit" form
    initialData?: Partial<ContactFormData>; 
};

// Default state for a new contact
const defaultState: ContactFormData = {
    contact_first_name: '',
    contact_last_name: '',
    contact_number: '',
    contact_email: '',
    note: '',
};

export default function ContactForm({ onSubmit, onCancel, initialData = {} }: ContactFormProps) {
    
    const [formData, setFormData] = useState<ContactFormData>({
        ...defaultState,
        ...initialData,
    });

    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation before submitting
        if (!formData.contact_first_name || !formData.contact_number) {
            alert('First Name and Phone Number are required.');
            return;
        }

        onSubmit(formData);
    };

    const inputStyle: React.CSSProperties = {
        padding: '10px',
        margin: '5px 0 15px 0',
        border: '1px solid #ffffffff',
        borderRadius: '4px',
        width: '100%',
        boxSizing: 'border-box',
        color: '#ffffffff' 
    };
    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#ff1515ff'
    };

    return (
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px' }}>
            <div>
                <label style={labelStyle} htmlFor="contact_first_name">First Name</label>
                <input
                    type="text"
                    id="contact_first_name"
                    name="contact_first_name"
                    style={inputStyle}
                    // 🛑 CRITICAL: Input value must be controlled by state
                    value={formData.contact_first_name} 
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label style={labelStyle} htmlFor="contact_last_name">Last Name</label>
                <input
                    type="text"
                    id="contact_last_name"
                    name="contact_last_name"
                    style={inputStyle}
                    // 🛑 CRITICAL: Input value must be controlled by state
                    value={formData.contact_last_name}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label style={labelStyle} htmlFor="contact_number">Number</label>
                <input
                    type="text"
                    id="contact_number"
                    name="contact_number"
                    style={inputStyle}
                    // 🛑 CRITICAL: Input value must be controlled by state
                    value={formData.contact_number}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label style={labelStyle} htmlFor="contact_email">Email</label>
                <input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    style={inputStyle}
                    // 🛑 CRITICAL: Input value must be controlled by state
                    value={formData.contact_email}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label style={labelStyle} htmlFor="note">Note</label>
                <textarea
                    id="note"
                    name="note"
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    // 🛑 CRITICAL: Input value must be controlled by state
                    value={formData.note}
                    onChange={handleChange}
                />
            </div>
            <div style={{ marginTop: '20px' }}>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
                    Save
                </button>
                <button type="button" onClick={onCancel} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Cancel
                </button>
            </div>
        </form>
    );
}