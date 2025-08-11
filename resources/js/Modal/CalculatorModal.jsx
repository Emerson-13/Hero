import React, { useState, useRef, useEffect } from 'react';

export default function CalculatorModal({ onClose }) {
    const [input, setInput] = useState('');
    const modalRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const isDragging = useRef(false);

    const handleMouseDown = (e) => {
        isDragging.current = true;
        dragOffset.current = {
            x: e.clientX - modalRef.current.getBoundingClientRect().left,
            y: e.clientY - modalRef.current.getBoundingClientRect().top
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        modalRef.current.style.left = `${e.clientX - dragOffset.current.x}px`;
        modalRef.current.style.top = `${e.clientY - dragOffset.current.y}px`;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleClick = (value) => {
        if (value === 'C') {
            setInput('');
        } else if (value === '=') {
            try {
                const result = eval(input).toString();
                setInput(result);
                navigator.clipboard.writeText(result);
            } catch {
                setInput('Error');
            }
        } else {
            setInput((prev) => prev + value);
        }
    };

    useEffect(() => {
        const el = modalRef.current;
        el.style.left = 'calc(50% - 160px)';
        el.style.top = '120px';
    }, []);

    const buttons = [
        '7', '8', '9', '/',
        '4', '5', '6', '*',
        '1', '2', '3', '-',
        '0', '.', '=', '+',
    ];

    return (
        <div
            ref={modalRef}
            className="fixed bg-white border shadow-xl rounded-xl p-4 w-80 z-50"
            style={{ cursor: 'move', position: 'fixed' }}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-3 cursor-move" onMouseDown={handleMouseDown}>
                <h2 className="text-lg font-semibold">🧮 Calculator</h2>
            </div>

            {/* Display */}
            <input
                type="text"
                value={input}
                readOnly
                className="w-full border rounded-md mb-3 p-2 text-right font-mono text-lg bg-gray-50"
            />

            {/* Buttons Grid */}
            <div className="grid grid-cols-4 gap-2 mb-2">
                {buttons.map((btn) => (
                    <button
                        key={btn}
                        onClick={() => handleClick(btn)}
                        className={`p-3 rounded-md text-lg font-medium ${
                            btn === '='
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        {btn}
                    </button>
                ))}
            </div>

            {/* Bottom Row */}
            <div className="flex justify-between gap-2">
                <button
                    onClick={() => handleClick('C')}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 rounded-md"
                >
                    Clear
                </button>
                <button
                    onClick={onClose}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
