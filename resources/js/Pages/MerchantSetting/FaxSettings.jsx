import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';

export default function DeviceCheck() {
    const [devices, setDevices] = useState({
        scanner: { connected: false, name: null },
        printer: { connected: false, name: null },
        cashDrawer: { connected: false, name: null }
    });

    // Mock device check functions (replace with actual detection logic)
    const checkScannerConnection = async () => {
        return { connected: false, name: null };
    };

    const checkPrinterConnection = async () => {
        return { connected: false, name: null };
    };

    const checkCashDrawerConnection = async () => {
        return { connected: false, name: null };
    };

    useEffect(() => {
        const checkDevices = async () => {
            const results = {
                scanner: await checkScannerConnection(),
                printer: await checkPrinterConnection(),
                cashDrawer: await checkCashDrawerConnection()
            };
            setDevices(results);

            if (!results.scanner.connected) console.warn("Scanner not detected — using manual entry.");
            if (!results.printer.connected) console.warn("Printer not detected — receipts will be digital.");
            if (!results.cashDrawer.connected) console.warn("Cash drawer not detected — use manual handling.");
        };

        checkDevices();
    }, []);

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow rounded">
            <Head title="Device Check" />
            <h2 className="text-lg font-bold mb-4">POS Device Status</h2>
            
            <div className="space-y-3">
                <DeviceStatus name="Barcode Scanner" device={devices.scanner} />
                <DeviceStatus name="Receipt Printer" device={devices.printer} />
                <DeviceStatus name="Cash Drawer" device={devices.cashDrawer} />
            </div>
        </div>
    );
}

function DeviceStatus({ name, device }) {
    return (
        <div className="flex justify-between items-center border p-3 rounded">
            <div>
                <span className="block font-medium">{name}</span>
                {device.connected && device.name && (
                    <span className="text-xs text-gray-500">{device.name}</span>
                )}
            </div>
            <span className={device.connected ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {device.connected ? "Connected ✅" : "Not Connected ❌"}
            </span>
        </div>
    );
}
