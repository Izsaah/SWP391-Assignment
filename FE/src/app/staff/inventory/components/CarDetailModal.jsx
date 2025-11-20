import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router';
import defaultVehicleImage from '../../../../assets/car1.jpg';

const CarDetailModal = ({ vehicle, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !vehicle) return null;

  // Get status information and styling
  const getStatusInfo = (status) => {
    const statusMap = {
      available: { 
        emoji: '🟢', 
        label: 'Available for Order', 
        color: 'text-green-600',
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
          { text: 'Create Order', style: 'bg-blue-600 hover:bg-blue-700 text-white', action: 'createOrder' },
          { text: 'Schedule Test Drive', style: 'bg-gray-100 hover:bg-gray-200 text-gray-700', action: 'scheduleTestDrive' }
        ];
      default:
        return [
          { text: 'Create Order', style: 'bg-blue-600 hover:bg-blue-700 text-white', action: 'createOrder' },
          { text: 'Schedule Test Drive', style: 'bg-gray-100 hover:bg-gray-200 text-gray-700', action: 'scheduleTestDrive' }
        ];
    }
  };

  const actionButtons = getActionButtons(vehicle.status);
  const title = vehicle.title || vehicle.model || vehicle.modelName || 'Vehicle';
  const vehicleImage = vehicle.imageUrl || vehicle.media?.[0]?.url || defaultVehicleImage;
  const formattedPrice = vehicle.priceUsd || vehicle.price || vehicle.dealerPrice || 0;

  // Handle create order - navigate to order form page with vehicle data
  const handleCreateOrder = () => {
    // Prepare vehicle data for order form
    // Map inventory vehicle structure to order form expected structure
    const orderVehicleData = {
      modelId: vehicle.modelId,
      variantId: vehicle.variantId,
      modelName: vehicle.title || vehicle.model || vehicle.modelName,
      title: vehicle.title,
      price: vehicle.price || vehicle.priceUsd || vehicle.dealerPrice,
      dealerPrice: vehicle.dealerPrice || vehicle.price || vehicle.priceUsd,
      color: vehicle.color || 'White',
      vin: vehicle.vin || 'Pending',
      serialId: vehicle.vin, // Use vin as serialId if available
      imageUrl: vehicle.imageUrl,
      status: vehicle.status,
      variant: vehicle.variant,
      model: vehicle.model || vehicle.title,
    };
    
    navigate('/staff/sales/order-form', { 
      state: { 
        vehicleData: orderVehicleData
      } 
    });
    onClose();
  };

  // Handle schedule test drive - navigate to test drive page with vehicle data
  const handleScheduleTestDrive = () => {
    // Prepare vehicle data for test drive
    const testDriveVehicleData = {
      modelId: vehicle.modelId,
      variantId: vehicle.variantId,
      modelName: vehicle.title || vehicle.model || vehicle.modelName,
      title: vehicle.title,
      serialId: vehicle.vin || '', // Pre-fill serial ID if available
      color: vehicle.color,
      imageUrl: vehicle.imageUrl,
    };
    
    navigate('/staff/customers/test-drives', { 
      state: { 
        vehicleData: testDriveVehicleData
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

        {/* Content */}
        <div className="h-[calc(95vh-100px)] flex flex-col lg:flex-row bg-white">
          {/* Image Column */}
          <div className="lg:w-1/2 h-1/2 lg:h-full relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-10">
            <div className="absolute top-6 left-6 text-xs uppercase tracking-[0.3em] text-white/70">
              Vehicle Preview
            </div>
            <img
              src={vehicleImage}
              alt={title}
              className="w-full max-h-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.45)]"
            />
            <div className="absolute bottom-6 left-6">
              <p className="text-sm text-white/70">Color</p>
              <p className="text-2xl font-semibold">{vehicle.color || 'Updating'}</p>
            </div>
            {vehicle.range && (
              <div className="absolute bottom-6 right-6 text-right">
                <p className="text-sm text-white/70">Range</p>
                <p className="text-2xl font-semibold">{vehicle.range}</p>
              </div>
            )}
          </div>

          {/* Detail Column */}
          <div className="lg:w-1/2 h-1/2 lg:h-full overflow-y-auto p-8 space-y-8">
            {/* Title & Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500 mt-2">Vehicle Configuration</p>
              <div className="mt-6">
                <p className="text-xs uppercase text-gray-500 tracking-wide">Price</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {new Intl.NumberFormat('vi-VN').format(formattedPrice)} ₫
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Variant</p>
                <p className="text-base font-semibold text-gray-900">{vehicle.variant || 'Updating'}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Status</p>
                <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  {vehicle.modelActive ? '✓ Active' : '✗ Inactive'}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Model ID</p>
                <p className="text-base font-semibold text-gray-900">{vehicle.modelId || '—'}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Variant ID</p>
                <p className="text-base font-semibold text-gray-900">{vehicle.variantId || '—'}</p>
              </div>
            </div>

            {/* Availability */}
            <div className="rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-gray-500 tracking-wide">Availability</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{statusInfo.label}</p>
                </div>
                <span className={`text-2xl ${statusInfo.color}`}>{statusInfo.emoji}</span>
              </div>
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs uppercase text-gray-500 tracking-wide mb-2">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              {actionButtons.map((button, index) => (
                <button 
                  key={index}
                  onClick={() => {
                    if (button.action === 'createOrder') {
                      handleCreateOrder();
                    } else if (button.action === 'scheduleTestDrive') {
                      handleScheduleTestDrive();
                    } else {
                      console.log(`Button clicked: ${button.text} (${button.action})`);
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
  );
};

export default CarDetailModal;
