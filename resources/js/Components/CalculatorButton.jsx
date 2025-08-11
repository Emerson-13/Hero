// src/components/ui/CalculatorButton.jsx
import React, { useState } from 'react';
import CalculatorModal from '../modal/CalculatorModal';
import PrimaryButton from './PrimaryButton'; // if using shadcn or custom button

export default function CalculatorButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <PrimaryButton onClick={() => setIsOpen(true)}>🧮 Calculator</PrimaryButton>
            {isOpen && <CalculatorModal onClose={() => setIsOpen(false)} />}
        </>
    );
}
