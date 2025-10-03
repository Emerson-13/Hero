import { CheckIcon } from '@heroicons/react/24/solid';

export default function ApproveButton({
    className = '',
    disabled,
    tooltip = 'Approve',
    ...props
}) {
    return (
        <button
            {...props}
            title={tooltip}
            className={
                `inline-flex items-center justify-center rounded-full bg-green-600 p-2 text-white 
                hover:bg-green-700 focus:bg-green-800 transition duration-150 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 
                active:bg-green-900 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ` + className
            }
            disabled={disabled}
        >
            <CheckIcon className="h-4 w-4" />
        </button>
    );
}
