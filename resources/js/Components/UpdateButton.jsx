import { PencilIcon } from '@heroicons/react/24/solid';

export default function UpdateButton({
    className = '',
    disabled,
    tooltip = 'Update',
    ...props
}) {
    return (
        <button
            {...props}
            title={tooltip}
            className={
                `inline-flex items-center justify-center rounded-full bg-blue-600 p-2 text-white 
                hover:bg-blue-700 focus:bg-blue-800 transition duration-150 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 
                active:bg-blue-900 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ` + className
            }
            disabled={disabled}
        >
            <PencilIcon className="h-4 w-4" />
        </button>
    );
}
