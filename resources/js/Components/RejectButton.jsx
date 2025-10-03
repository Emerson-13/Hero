import { XCircleIcon } from '@heroicons/react/24/solid';

export default function RejectButton({
    className = '',
    disabled,
    tooltip = 'Reject',
    ...props
}) {
    return (
        <button
            {...props}
            title={tooltip}
            className={
                `inline-flex items-center justify-center rounded-full bg-orange-600 p-2 text-white 
                hover:bg-orange-700 focus:bg-orange-800 transition duration-150 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 
                active:bg-orange-900 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ` + className
            }
            disabled={disabled}
        >
            <XCircleIcon className="h-4 w-4" />
        </button>
    );
}
