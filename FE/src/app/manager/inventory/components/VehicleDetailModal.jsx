import React, { useState } from 'react';
import { X, CheckCircle, Clock, ShoppingCart, Edit2, Save, XCircle } from 'lucide-react';

const VehicleDetailModal = ({ vehicle, isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState(null);

  if (!isOpen || !vehicle) return null;

  // Initialize edited vehicle when entering edit mode
  const handleEditClick = () => {
    setIsEditing(true);
    setEditedVehicle({
      ...vehicle,
      price: vehicle.price,
      color: vehicle.color,
      dealer: vehicle.dealer,
      status: vehicle.status
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedVehicle(null);
  };

  const handleSaveEdit = () => {
    // In real implementation, this would call an API to update the vehicle
    console.log('Saving vehicle:', editedVehicle);
    // Update the vehicle data (in real app, this would come from API response)
    setIsEditing(false);
    setEditedVehicle(null);
    // You could call an onUpdate callback here if needed
  };

  const handleFieldChange = (field, value) => {
    setEditedVehicle(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'Available':
        return {
          label: 'Available',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle
        };
      case 'Reserved':
        return {
          label: 'Reserved',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: Clock
        };
      case 'Sold':
        return {
          label: 'Sold',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: ShoppingCart
        };
      default:
        return {
          label: status,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: CheckCircle
        };
    }
  };

  const currentVehicle = isEditing ? editedVehicle : vehicle;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Details</h2>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={handleEditClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-indigo-600"
                title="Edit vehicle details"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="p-2 hover:bg-green-50 rounded-lg transition-colors text-gray-600 hover:text-green-600"
                  title="Save changes"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                  title="Cancel editing"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Image */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center h-64">
                {vehicle.img ? (
                  <img 
                    src={vehicle.img} 
                    alt={vehicle.model}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">🚗</div>
                    <div className="text-lg">No Image Available</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="space-y-6">
              {/* Model Name & Price */}
              <div className="pb-4 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {currentVehicle.model}
                </h1>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Price</div>
                  {isEditing ? (
                    <input
                      type="number"
                      value={currentVehicle.price}
                      onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
                      className="text-4xl font-bold text-gray-900 w-full border-b-2 border-indigo-500 focus:outline-none focus:border-indigo-600"
                    />
                  ) : (
                    <div className="text-4xl font-bold text-gray-900">
                      {formatPrice(currentVehicle.price)}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className={`rounded-lg border-2 p-4 ${getStatusInfo(currentVehicle.status).bgColor} ${getStatusInfo(currentVehicle.status).borderColor}`}>
                <div className="flex items-center space-x-2">
                  {React.createElement(getStatusInfo(currentVehicle.status).icon, { className: `w-5 h-5 ${getStatusInfo(currentVehicle.status).color}` })}
                  <div>
                    <p className={`font-semibold ${getStatusInfo(currentVehicle.status).color}`}>Status: {getStatusInfo(currentVehicle.status).label}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">VIN</div>
                    <div className="text-sm font-mono font-medium text-gray-900">{currentVehicle.vin}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Color</div>
                    {isEditing ? (
                      <select
                        value={currentVehicle.color}
                        onChange={(e) => handleFieldChange('color', e.target.value)}
                        className="text-sm font-medium text-gray-900 w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="White">White</option>
                        <option value="Black">Black</option>
                        <option value="Blue">Blue</option>
                        <option value="Red">Red</option>
                        <option value="Green">Green</option>
                        <option value="Silver">Silver</option>
                        <option value="Gray">Gray</option>
                      </select>
                    ) : (
                      <div className="text-sm font-medium text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {currentVehicle.color}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Dealer</div>
                    {isEditing ? (
                      <select
                        value={currentVehicle.dealer}
                        onChange={(e) => handleFieldChange('dealer', e.target.value)}
                        className="text-sm font-medium text-gray-900 w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Dealer A">Dealer A</option>
                        <option value="Dealer B">Dealer B</option>
                        <option value="Dealer C">Dealer C</option>
                      </select>
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{currentVehicle.dealer}</div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Import Date</div>
                    {isEditing ? (
                      <input
                        type="date"
                        value={currentVehicle.importDate}
                        onChange={(e) => handleFieldChange('importDate', e.target.value)}
                        className="text-sm font-medium text-gray-900 w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{currentVehicle.importDate}</div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Days in Stock</div>
                    <div className="text-sm font-medium text-gray-900">{currentVehicle.days} days</div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Vehicle is currently {currentVehicle.status.toLowerCase()} in inventory</p>
                  <p>• Located at {currentVehicle.dealer}</p>
                  {currentVehicle.status === 'Sold' && (
                    <p>• This vehicle has been sold and delivered to customer</p>
                  )}
                  {currentVehicle.status === 'Reserved' && (
                    <p>• This vehicle is reserved for a customer</p>
                  )}
                  {currentVehicle.status === 'Available' && (
                    <p>• This vehicle is available for sale</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          {isEditing && (
            <div className="flex-1 text-sm text-gray-500 italic">
              Editing mode • Click save to apply changes
            </div>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailModal;

