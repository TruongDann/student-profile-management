import React from 'react';

// --- Card ---
// Clean, professional card with subtle shadow and rounded corners
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {title && (
      <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
      </div>
    )}
    <div className="p-5">
      {children}
    </div>
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'zalo';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1";
  
  const variants = {
    // Changed to Yellow theme. Note: Yellow background needs dark text for contrast.
    primary: "bg-yellow-400 text-slate-900 hover:bg-yellow-500 focus:ring-yellow-300 shadow-sm", 
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-200",
    danger: "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 focus:ring-rose-500",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700",
    zalo: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang xử lý...
        </>
      ) : children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
    <input 
      className={`w-full px-4 py-2.5 rounded-lg border ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-yellow-500 focus:ring-yellow-200'} focus:ring-4 transition-all outline-none bg-white ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
  </div>
);

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'blue' | 'gray' | 'purple' | 'yellow' }> = ({ children, color = 'blue' }) => {
  const colors = {
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border border-blue-100',
    gray: 'bg-slate-100 text-slate-600 border border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-100',
    yellow: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

// --- Toast ---
export const Toast: React.FC<{ message: string; type?: 'success' | 'error' }> = ({ message, type = 'success' }) => (
  <div className={`fixed bottom-6 right-6 z-[60] px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up ${
    type === 'success' ? 'bg-slate-800 text-white' : 'bg-rose-600 text-white'
  }`}>
    <span className="font-medium">{message}</span>
  </div>
);