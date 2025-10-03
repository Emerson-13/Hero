import { EyeIcon } from '@heroicons/react/24/solid';

export default function ViewButton({
    className = '',
    disabled,
    tooltip = 'View',
    ...props
}) {
    return (
        <button
            {...props}
            title={tooltip}
            className={
                `inline-flex items-center justify-center rounded-full bg-blue-500 p-2 text-white 
                hover:bg-blue-600 focus:bg-blue-700 transition duration-150 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 
                active:bg-blue-800 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ` + className
            }
            disabled={disabled}
        >
            <EyeIcon className="h-4 w-4" />
        </button>
    );
}
