// app/address/page.tsx
'use client';
import React from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';

export default function AddressPage() {
  return (
    <ProtectedLayout>
      <div>
        <h2>Addresses</h2>
        <p>
          Addresses are stored per contact. To add an address, open <strong>Contacts</strong> and click
          <em> Add Address</em> for a specific contact. You can expand this page into a full address list if required.
        </p>
      </div>
    </ProtectedLayout>
  );
}
