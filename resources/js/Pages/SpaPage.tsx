import React from 'react';
import { Head } from '@inertiajs/react';

export default function SpaPage({ spas }: any) {
    return (
        <div>
            <Head title="Spas" />
            <h1>Spa Page is Working! 🎉</h1>
            <p>If you see this, the frontend route is working!</p>
            <p>Number of spas: {spas.length}</p>
        </div>
    );
}
