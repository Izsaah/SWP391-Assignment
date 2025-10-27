import React, { useState } from 'react';
import { X, Plus, Check, X as CloseIcon } from 'lucide-react';
import { useNavigate } from 'react-router';

const CarDetailModal = ({ vehicle, isOpen, onClose }) => {
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();

  if (!isOpen || !vehicle) return null;

  // Get status information and styling
  const getStatusInfo = (status) => {
    const statusMap = {
      available: { 
        emoji: '🟢', 
        label: 'Available for Quotation', 
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      reserved: { 
        emoji: '🟡', 
        label: 'Reserved by Le Minh Tuan', 
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      sold: { 
        emoji: '🔴', 
        label: 'Sold — Delivered on 15/10/2025', 
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
    };
    return statusMap[status] || statusMap.available;
  };

  const statusInfo = getStatusInfo(vehicle.status);

  // Get action buttons based on status
  const getActionButtons = (status) => {
    switch (status) {
      case 'available':
        return [
          { text: 'Create Quotation', style: 'bg-blue-600 hover:bg-blue-700 text-white' },
          { text: 'Schedule Test Drive', style: 'bg-gray-100 hover:bg-gray-200 text-gray-700' }
        ];
      case 'reserved':
        return [
          { text: 'View Quotation / Contract', style: 'bg-blue-600 hover:bg-blue-700 text-white' },
          { text: 'Contact Customer', style: 'bg-gray-100 hover:bg-gray-200 text-gray-700' }
        ];
      case 'sold':
        return [
          { text: 'Track Delivery', style: 'bg-blue-600 hover:bg-blue-700 text-white' },
          { text: 'View Contract', style: 'bg-gray-100 hover:bg-gray-200 text-gray-700' }
        ];
      default:
        return [
          { text: 'Create Quotation', style: 'bg-blue-600 hover:bg-blue-700 text-white' },
          { text: 'Schedule Test Drive', style: 'bg-gray-100 hover:bg-gray-200 text-gray-700' }
        ];
    }
  };

  const actionButtons = getActionButtons(vehicle.status);

  // Handle adding new notes
  const handleAddNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now(),
        text: newNote.trim(),
        timestamp: new Date().toLocaleString(),
        author: 'Current User'
      };
      setNotes([...notes, note]);
      setNewNote('');
      setShowAddNote(false);
    }
  };

  const handleCancelNote = () => {
    setNewNote('');
    setShowAddNote(false);
  };

  // Handle create quotation - navigate to quotations page with vehicle data
  const handleCreateQuotation = () => {
    navigate('/sales/quotations', { 
      state: { 
        vehicleData: {
          id: vehicle.id,
          title: vehicle.title,
          vin: vehicle.vin || 'Pending',
          dealerPrice: vehicle.dealerPrice,
          msrp: vehicle.msrp,
          discount: vehicle.discount,
          imageUrl: vehicle.imageUrl,
          status: vehicle.status,
          location: vehicle.location,
          range: vehicle.range,
          topSpeed: vehicle.topSpeed,
          acceleration: vehicle.acceleration,
          driveType: vehicle.driveType,
          batteryCapacity: vehicle.batteryCapacity,
          seating: vehicle.seating,
          warranty: vehicle.warranty,
          mileage: vehicle.mileage,
        }
      } 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Vehicle Configuration
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content - Tesla Style Layout */}
        <div className="flex h-[calc(95vh-100px)]">
          {/* Left Side - Car Image (60% width) */}
          <div className="w-3/5 bg-white flex items-center justify-center relative">
            <div className="w-full h-full flex items-center justify-center p-8">
              {vehicle.imageUrl ? (
                <div className="relative w-full max-w-lg">
                  <img 
                    src={vehicle.imageUrl} 
                    alt={vehicle.title}
                    className="w-full h-auto object-contain"
                  />
                  {/* Image navigation arrows */}
                  <button className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all border border-gray-200">
                    <span className="text-gray-600 text-lg">‹</span>
                  </button>
                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all border border-gray-200">
                    <span className="text-gray-600 text-lg">›</span>
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-4">🚗</div>
                  <div className="text-lg">No Image Available</div>
                </div>
              )}
            </div>
            {/* Image label */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded text-sm backdrop-blur-sm">
              Front View of {vehicle.title}
            </div>
          </div>

          {/* Right Side - Vehicle Status (40% width) */}
          <div className="w-2/5 bg-white overflow-y-auto">
            <div className="p-8 space-y-8">
              {/* Model Name & Price */}
              <div className="pb-6 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  {vehicle.title}
                </h1>
                
                {/* Price - Prominent Display */}
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-1">Price</div>
                  <div className="text-4xl font-bold text-gray-900">
                    ${vehicle.priceUsd?.toLocaleString() || 'N/A'}
                  </div>
                </div>

                {/* Vehicle Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {vehicle.variant && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-1">Variant</div>
                      <div className="text-sm font-medium text-gray-900">{vehicle.variant}</div>
                    </div>
                  )}
                  {vehicle.color && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-1">Color</div>
                      <div className="text-sm font-medium text-gray-900">{vehicle.color}</div>
                    </div>
                  )}
                  {vehicle.quantity && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-1">Available</div>
                      <div className="text-sm font-medium text-gray-900">{vehicle.quantity} units</div>
                    </div>
                  )}
                  {vehicle.modelActive !== undefined && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-1">Status</div>
                      <div className="text-sm font-medium text-gray-900">
                        {vehicle.modelActive ? '✓ Active' : '✗ Inactive'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Information */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Technical Information
                </h3>
                
                <div className="space-y-3">
                  {vehicle.modelId && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Model ID</span>
                      <span className="text-sm font-medium text-gray-900">{vehicle.modelId}</span>
                    </div>
                  )}
                  
                  {vehicle.variantId && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Variant ID</span>
                      <span className="text-sm font-medium text-gray-900">{vehicle.variantId}</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 italic mt-4 pt-3 border-t border-gray-200">
                    Additional details require backend API update
                  </div>
                </div>
              </div>

              {/* Availability Status */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Availability
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`text-sm font-semibold ${statusInfo.color} flex items-center gap-1.5`}>
                      <span>{statusInfo.emoji}</span>
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>
                  
                  {/* Notes */}
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-700">Notes</div>
                      <button
                        onClick={() => setShowAddNote(true)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Show message if no notes */}
                      {notes.length === 0 && !showAddNote && (
                        <div className="text-sm text-gray-400 italic py-2">
                          No notes yet
                        </div>
                      )}

                      {/* User-added notes */}
                      {notes.map((note) => (
                        <div key={note.id} className="rounded-lg p-3 border border-gray-200 bg-gray-50">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <div className="text-sm text-gray-700">{note.text}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {note.timestamp}
                              </div>
                            </div>
                            <button
                              onClick={() => setNotes(notes.filter(n => n.id !== note.id))}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <CloseIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Note Input */}
                      {showAddNote && (
                        <div className="rounded-lg p-3 border-2 border-blue-200">
                          <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Type your note here..."
                            className="w-full text-sm border-none outline-none resize-none bg-transparent text-gray-700"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={handleCancelNote}
                              className="text-xs text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleAddNote}
                              disabled={!newNote.trim()}
                              className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 space-y-3">
                {actionButtons.map((button, index) => (
                  <button 
                    key={index}
                    onClick={() => {
                      if (button.text === 'Create Quotation') {
                        handleCreateQuotation();
                      } else {
                        // Handle other button actions
                        console.log(`Button clicked: ${button.text}`);
                      }
                    }}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${button.style}`}
                  >
                    {button.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailModal;
