/* eslint-disable function-paren-newline */
/**
 * VendorPage Component
 *
 * This component is responsible for displaying a table of vendors retrieved from the backend.
 * It utilizes the Table component for the table structure. The component fetches vendor data
 * using an asynchronous call to getVendors and handles potential errors.
 *
 * Functionality:
 * - Defines columns for the table, specifying the column ID, label, and minimum width
 * - Manages state for vendors data and error handling
 * - Fetches vendor data when the component mounts using useEffect, and updates state accordingly
 * - Dynamically creates rows for the table from the fetched vendors data
 * - Displays the table with vendors data and handles errors by displaying an error message if any
 *
 * Structure:
 * - The main component VendorPage encapsulates the entire functionality
 * - The return statement includes a header and the table wrapped in a div for styling
 * - Error messages are displayed in red color if there is an error during data fetching
 *
 * @returns {JSX.Element} A React component that displays a vendor page
 */

import React, { useEffect, useState } from 'react';
import '../index.css';
import StickyHeadTable, { createRow } from '../Component/Table';
import { getVendors } from '../apiService';
import AddVendor from './AddVendor';
import EditVendor from './EditVendor';
import DeleteVendor from './DeleteVendor';
import SuccessModal from '../Component/SuccessModal';
import TableFilter from '../Component/TableFilter';

export default function VendorPage() {
  // Create column names, id's, minimum width
  const columns = [
    { id: 'id', label: 'ID', minWidth: 50 },
    { id: 'vendorName', label: 'Vendor Name', minWidth: 100 },
    { id: 'address', label: 'Address', minWidth: 100 },
    { id: 'contact', label: 'Contact', minWidth: 100 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'phone number', label: 'Phone Number', minWidth: 100 },
    { id: 'role', label: 'Role', minWidth: 100 },
    { id: 'deleteIcon', label: '', minWidth: 25 }
  ];

  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [currentVendor, setCurrentVendor] = useState({});

  // Get all vendors from the database and store it in vendors array
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await getVendors();
        // Sort vendors by ID in ascending order
        data.sort((a, b) => (a.id > b.id ? 1 : -1));
        setVendors(data);
      } catch (err) {
        setError(err);
      }
    };

    fetchVendors();
  }, [refresh]);

  // Toggles the refresh state, to trigger a refresh when a new vendor is successfully submitted.
  const handleRefresh = () => {
    setRefresh((prev) => !prev);
  };

  // toggles success modal and refreshes to handle delete
  const handleDeleteSuccess = () => {
    setShowSuccessModal(true);
    handleRefresh();
  };

  // closes success modal
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const rows = [];

  // Create rows from the vendor array
  vendors.map((vendor) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    rows.push(
      createRow(
        columns,
        [
          <EditVendor vendor={vendor} onRefresh={handleRefresh} />,
          vendor.name,
          `${vendor.address.street}${vendor.address.street2 ? `, ${vendor.address.street2}` : ''}, ${vendor.address.city}, ${vendor.address.state} ${vendor.address.zipCode}`,
          vendor.contact.contactName,
          vendor.contact.email,
          vendor.contact.phone,
          vendor.contact.titleOrRole,
          <DeleteVendor vendorId={vendor.id} onDeleteSuccess={handleDeleteSuccess} />
        ],
        vendor.id
      )
    )
  );

  // If there are less than 6 rows, create empty rows to fill out table
  while (rows.length < 6) {
    rows.push(createRow(columns, Array(columns.length).fill('')));
  }

  const temporaryFields = [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Name', keys: 'name' },
    {
      id: 'street', label: 'Street', keys: 'street', fieldPath: '.address.street'
    },
    {
      id: 'street2', label: 'Street 2', keys: 'street2', fieldPath: '.address.street2'
    },
    {
      id: 'city', label: 'City', keys: 'city', fieldPath: '.address.city'
    },
    {
      id: 'state', label: 'State', keys: 'state', fieldPath: '.address.state'
    },
    {
      id: 'zipCode', label: 'Zip Code', keys: 'zipCode', fieldPath: '.address.zipCode'
    },
    {
      id: 'email', label: 'Email', keys: 'email', fieldPath: '.contact.email'
    },
    {
      id: 'contactName', label: 'Contact Name', keys: 'contactName', fieldPath: '.contact.contactName'
    },
    {
      id: 'titleOrRole', label: 'Title or Role', keys: 'titleOrRole', fieldPath: '.contact.titleOrRole'
    },
    {
      id: 'phone', label: 'Phone', keys: 'phone', fieldPath: '.contact.phone'
    }
  ];

  return (
    <div className='pages-table'>
      <div className='header-modal-container'>
        <h1 style={{ fontFamily: 'Roboto, sans-serif' }}>Vendors</h1>
        <AddVendor onRefresh={handleRefresh} />
      </div>
      {showSuccessModal && (
        <SuccessModal message='Vendor was successfully deleted!' onClose={closeSuccessModal} />
      )}
      <StickyHeadTable columns={columns} rows={rows} />
      <TableFilter
        fields={temporaryFields}
        getDomain={getVendors}
        setDomain={setVendors}
        setError={setError}
        onRefresh={handleRefresh}
      />
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
    </div>
  );
}
