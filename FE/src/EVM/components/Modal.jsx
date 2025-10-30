import React from 'react'

const Modal = ({ title, children, open, onClose, onSubmit, submitText = 'Save' }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-5">
          {children}
        </div>
        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-sm border border-gray-300 rounded">Cancel</button>
          <button onClick={onSubmit} className="px-3 py-2 text-sm bg-blue-600 text-white rounded">{submitText}</button>
        </div>
      </div>
    </div>
  )
}

export default Modal


