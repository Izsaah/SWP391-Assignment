import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessModal = ({ 
  open, 
  onClose, 
  title = 'Success!',
  message = 'Operation completed successfully!',
  details = null, // Object with key-value pairs to display
  footerMessage = null // Additional message at the bottom
}) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
          </div>

          {/* Details Section */}
          {details && Object.keys(details).length > 0 && (
            <div className="mt-4 space-y-2 bg-gray-50 rounded-lg p-4">
              {Object.entries(details).map(([key, value]) => (
                <div key={key} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-700">{key}:</span>
                  <span className="text-sm text-gray-900 text-right ml-4">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer Message */}
          {footerMessage && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              {footerMessage}
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;

