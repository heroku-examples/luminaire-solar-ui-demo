/**
 * Toggle Switch component with accessibility support
 * @param {Object} props
 * @param {boolean} props.checked - Toggle state
 * @param {(checked: boolean) => void} props.onChange - Change handler
 * @param {boolean} [props.disabled] - Disabled state
 * @param {boolean} [props.loading] - Loading state
 * @param {string} props.label - Accessible label
 * @param {string} [props.id] - HTML ID
 */
export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  loading = false,
  label,
  id,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      id={id}
      disabled={disabled || loading}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-12 w-20 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-40 focus:ring-offset-2
        ${checked ? 'bg-[#10b981]' : 'bg-[#d1d5db]'}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-11 w-11 transform rounded-full bg-white shadow-lg ring-0
          transition duration-200 ease-in-out flex items-center justify-center
          ${checked ? 'translate-x-8' : 'translate-x-0'}
        `}
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
