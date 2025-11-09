import React, { useState } from 'react';
import Layout from '../layout/Layout';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  UserCheck,
  X,
  Save,
  XCircle,
  CheckCircle,
  ChevronRight,
  Users,
  Car,
  MapPin,
  Phone,
  Clock,
  FileText,
  Sparkles
} from 'lucide-react';

const TestDriveSchedule = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [vehicleModelFilter, setVehicleModelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Form state for drawer
  const [drawerForm, setDrawerForm] = useState({
    assignedStaff: '',
    status: '',
    notes: ''
  });

  // Test drive appointments data - to be fetched from API
  const [appointments, setAppointments] = useState([]);

  // Get unique lists for filters
  const staffList = [...new Set(appointments.map(a => a.assignedStaff).filter(Boolean))];
  const vehicleModels = [...new Set(appointments.map(a => a.vehicleModel))];

  // Get all available staff for assignment - to be fetched from API
  const [allStaff, setAllStaff] = useState([]);

  // Helper functions
  const formatDateTime = (date, time) => {
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year} ${time}`;
  };

  const getStatusBadge = (status) => {
    const configs = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      'Confirmed': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Confirmed' },
      'Completed': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
      'Cancelled': { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Cancelled' }
    };
    const config = configs[status] || configs['Pending'];

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    // Date range filter
    if (dateFrom && appointment.date < dateFrom) return false;
    if (dateTo && appointment.date > dateTo) return false;

    // Status filter
    if (statusFilter !== 'all' && appointment.status !== statusFilter) return false;

    // Staff filter
    if (staffFilter !== 'all' && appointment.assignedStaff !== staffFilter) return false;

    // Vehicle model filter
    if (vehicleModelFilter !== 'all' && appointment.vehicleModel !== vehicleModelFilter) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches = 
        appointment.customerName.toLowerCase().includes(query) ||
        appointment.customerPhone.includes(query) ||
        appointment.serial.toLowerCase().includes(query);
      if (!matches) return false;
    }

    return true;
  });

  // Handle view appointment
  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setDrawerForm({
      assignedStaff: appointment.assignedStaffId || '',
      status: appointment.status,
      notes: appointment.notes || ''
    });
    setIsDrawerOpen(true);
  };

  // Handle save changes
  const handleSaveChanges = () => {
    // In real app, would make API call to update appointment
    console.log('Saving changes:', drawerForm);
    alert('Changes saved successfully!');
    setIsDrawerOpen(false);
    // Refresh data would happen here
  };

  // Handle cancel appointment
  const handleCancelAppointment = () => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      // In real app, would make API call to cancel
      console.log('Cancelling appointment:', selectedAppointment.id);
      alert('Appointment cancelled successfully!');
      setIsDrawerOpen(false);
      // Refresh data would happen here
    }
  };

  // Handle mark as completed
  const handleMarkCompleted = () => {
    // In real app, would make API call to mark as completed
    console.log('Marking appointment as completed:', selectedAppointment.id);
    alert('Appointment marked as completed!');
    setIsDrawerOpen(false);
    // Refresh data would happen here
  };

  // Handle auto assign
  const handleAutoAssign = () => {
    if (window.confirm('Auto-assign all pending appointments evenly to staff?')) {
      // In real app, would make API call to auto-assign
      console.log('Auto-assigning pending appointments');
      alert('Pending appointments assigned successfully!');
      // Refresh data would happen here
    }
  };

  // Handle assign/update staff for specific appointment
  const handleAssign = (appointment) => {
    setSelectedAppointment(appointment);
    setDrawerForm({
      assignedStaff: appointment.assignedStaffId || '',
      status: appointment.status,
      notes: appointment.notes || ''
    });
    setIsDrawerOpen(true);
  };

  // Handle cancel for specific appointment
  const handleCancel = (appointment) => {
    if (window.confirm(`Cancel appointment ${appointment.id}?`)) {
      // In real app, would make API call to cancel
      console.log('Cancelling appointment:', appointment.id);
      alert('Appointment cancelled successfully!');
      // Refresh data would happen here
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium">Test Drive Schedule</span>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test Drive Schedule</h1>
            <p className="text-sm text-gray-600 mt-1">Manage test drive appointments and assignments</p>
          </div>
          <button
            onClick={handleAutoAssign}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto Assign Pending Appointments</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
              <span className="text-xs text-gray-500">({filteredAppointments.length} results)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Date Range - From */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date Range - To */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Staff Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Staff</label>
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                {staffList.map(staff => (
                  <option key={staff} value={staff}>{staff}</option>
                ))}
              </select>
            </div>

            {/* Vehicle Model Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Model</label>
              <select
                value={vehicleModelFilter}
                onChange={(e) => setVehicleModelFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                {vehicleModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Customer Name / Phone / Serial"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Date/Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Vehicle (Variant)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Serial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Assigned Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDateTime(appointment.date, appointment.time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{appointment.customerName}</div>
                        <div className="text-xs text-gray-500">{appointment.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{appointment.vehicleModel}</div>
                        <div className="text-xs text-gray-500">{appointment.vehicleVariant}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{appointment.serial}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {appointment.assignedStaff || <span className="text-gray-400 italic">Unassigned</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(appointment)}
                          className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                        >
                          View
                        </button>
                        {appointment.status !== 'Completed' && appointment.status !== 'Cancelled' && (
                          <>
                            {!appointment.assignedStaff && (
                              <button
                                onClick={() => handleAssign(appointment)}
                                className="text-green-600 hover:text-green-900 text-xs font-medium"
                              >
                                Assign
                              </button>
                            )}
                            <button
                              onClick={() => handleCancel(appointment)}
                              className="text-red-600 hover:text-red-900 text-xs font-medium"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {appointment.status === 'Confirmed' && (
                          <button
                            onClick={() => {
                              if (window.confirm('Mark this appointment as completed?')) {
                                // Handle mark as completed
                                alert('Appointment marked as completed!');
                              }
                            }}
                            className="text-green-600 hover:text-green-900 text-xs font-medium"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {isDrawerOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Test Drive Detail</h2>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-sm text-gray-600">Appointment ID: {selectedAppointment.id}</div>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6">
              {/* Appointment Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Appointment Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Date & Time</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatDateTime(selectedAppointment.date, selectedAppointment.time)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      Location
                    </label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedAppointment.location}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Name</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedAppointment.customerName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      Phone
                    </label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedAppointment.customerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Car className="w-4 h-4 mr-2" />
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Model</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedAppointment.vehicleModel}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Variant</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedAppointment.vehicleVariant}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-600">Serial</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedAppointment.serial}</p>
                  </div>
                </div>
              </div>

              {/* Assigned Staff */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Staff
                </label>
                <select
                  value={drawerForm.assignedStaff}
                  onChange={(e) => setDrawerForm({ ...drawerForm, assignedStaff: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Staff</option>
                  {allStaff.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={drawerForm.status}
                  onChange={(e) => setDrawerForm({ ...drawerForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Notes
                </label>
                <textarea
                  value={drawerForm.notes}
                  onChange={(e) => setDrawerForm({ ...drawerForm, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add notes about this test drive appointment..."
                />
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-2">
                {selectedAppointment.status !== 'Completed' && selectedAppointment.status !== 'Cancelled' && (
                  <button
                    onClick={handleCancelAppointment}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel Appointment</span>
                  </button>
                )}
                {selectedAppointment.status === 'Confirmed' && (
                  <button
                    onClick={handleMarkCompleted}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Completed</span>
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TestDriveSchedule;
