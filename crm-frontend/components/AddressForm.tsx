// components/AddressForm.tsx
import React, { useState, CSSProperties } from 'react';
import api from '@/lib/api'; // Assuming you have an API client setup
import { Address } from '@/app/dashboard/page'; // Import Address type definition

// Define the required props for the AddressForm
interface AddressFormProps {
    contactId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AddressForm({ contactId, onSuccess, onCancel }: AddressFormProps) {
    
    // Initial state matching your SQL table fields (excluding auto-generated ones)
    const [formData, setFormData] = useState<Omit<Address, 'id' | 'contact_id'>>({
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        country: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        // Payload combines the contactId (from props) with the form data
        const payload = {
            contact_id: contactId,
            ...formData
        };

        try {
            // 🎯 API Call to create the new address
            await api.post('/api/addresses', payload); 
            
            // Success: Close the form and refresh the dashboard
            onSuccess(); 
        } catch (err: any) {
            console.error('Failed to add address:', err);
            setError(err?.response?.data?.error || 'Failed to save address. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- STYLES (Updated Label Color) ---
    const INPUT_STYLE: CSSProperties = {
        padding: '10px',
        margin: '5px 0 15px 0',
        borderRadius: '4px',
        border: '1px solid #ccc',
        width: '100%',
        boxSizing: 'border-box',
        color: '#fafdffff', // Input text color
    };
    
    const LABEL_STYLE: CSSProperties = {
        // ✅ NEW STYLE: Changed label color to white for better contrast on a dark background
        color: '#000000ff', 
        fontWeight: 'bold',
        display: 'block', // Ensures label takes full width for block flow
    };
    
    const BUTTON_PRIMARY: CSSProperties = {
        padding: '10px 20px',
        backgroundColor: '#FF4700', // Primary Orange
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginRight: '10px'
    };
    const BUTTON_SECONDARY: CSSProperties = {
        padding: '10px 20px',
        backgroundColor: '#f8f9fa', // Light gray
        color: '#495057',
        border: '1px solid #ccc',
        borderRadius: '6px',
        cursor: 'pointer'
    };

    // Style for the Contact ID title, changed to white for dark mode
    const TITLE_STYLE: CSSProperties = {
        gridColumn: '1 / 3', 
        margin: '0 0 15px 0', 
        color: '#000000ff' // Changed color to white
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <h4 style={TITLE_STYLE}>Adding address to Contact ID: **{contactId}**</h4>
                
            {error && <p style={{ color: 'red', gridColumn: '1 / 3' }}>{error}</p>}

            <div>
                <label htmlFor="address_line1" style={LABEL_STYLE}>Address line1</label>
                <input type="text" id="address_line1" name="address_line1" value={formData.address_line1} onChange={handleChange} style={INPUT_STYLE} required />
            </div>

           

            <div>
                <label htmlFor="city" style={LABEL_STYLE}>Address line2</label>
                <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} style={INPUT_STYLE} required />
            </div>

            <div>
                <label htmlFor="state" style={LABEL_STYLE}>State:</label>
                <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} style={INPUT_STYLE} />
            </div>
            
            <div>
                <label htmlFor="pincode" style={LABEL_STYLE}>Pincode:</label>
                <input type="text" id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} style={INPUT_STYLE} />
            </div>
            

            <div style={{ gridColumn: '1 / 3', marginTop: '10px' }}>
                <button type="submit" disabled={loading} style={BUTTON_PRIMARY}>
                    {loading ? 'Saving...' : 'Save Address'}
                </button>
                <button type="button" onClick={onCancel} disabled={loading} style={BUTTON_SECONDARY}>
                    Cancel
                </button>
            </div>
        </form>
    );
}