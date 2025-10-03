import { TrashIcon } from '@heroicons/react/24/solid';

export default function DeleteButton({
    className = '',
    disabled,
    tooltip = 'Delete',
    ...props
}) {
    return (
        <button
            {...props}
            title={tooltip}
            className={
                `inline-flex items-center justify-center rounded-full bg-red-600 p-2 text-white 
                hover:bg-red-700 focus:bg-red-800 transition duration-150 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 
                active:bg-red-900 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ` + className
            }
            disabled={disabled}
        >
            <TrashIcon className="h-4 w-4" />
        </button>
    );
}
