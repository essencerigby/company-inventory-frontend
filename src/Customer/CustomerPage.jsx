/**
 * Customer Page Component
 *
 * This component displays a table of customers retrieved from the backend/database.
 * It utilizes the Table component for the table structure.The component fetches customer data
 * using an asynchronous call to getCustomers and handles potential errors.
 *
 * Functionality:
 * - Defines columns for the table, specifying the column ID, label, and minimum width.
 * - Manages state for customers data and error handling.
 * - Fetches customer data when the component mounts using useEffect, and updates state accordingly.
 * - Dynamically creates rows for the table from the fetched customers data.
 * - Displays the table with customers data
 * - Handles errors by displaying an error message if any.
 *
 * Structure:
 * - The main component CustomerPage encapsulates the entire functionality.
 * - The return statement includes a header and the table wrapped in a div for styling.
 * - Error messages are displayed in red color if there is an error during data fetching.
 *
 * @returns {JSX.Element} A React component that displays a customer page.
 */

/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable max-len */
/* eslint-disable function-paren-newline */

import React, { useEffect, useState } from 'react';
import StickyHeadTable, { createRow } from '../Component/Table';
import EditCustomerModal from './EditCustomerModal';
import NewCustomerModal from './NewCustomerModal';
import { getCustomers } from '../apiService';
import DeleteCustomer from './DeleteCustomer';
import SuccessModal from '../Component/SuccessModal';
import TableFilter from '../Component/TableFilter';

export default function CustomerPage() {
  const columns = [
    { id: 'id', label: 'ID', minWidth: 40 },
    { id: 'active', label: 'Active', minWidth: 40 },
    { id: 'name', label: 'Customer Name', minWidth: 100 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'lifetimeSpent', label: 'Lifetime Spent', minWidth: 100 },
    { id: 'customerSince', label: 'Customer Since', minWidth: 100 },
    { id: 'deleteIcon', minWidth: 20 }
  ];

  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  // Formats lifetimeSpent as a currency string with two decimal places
  const formatLifetimeSpent = (lifetimeSpent) => `$${Number(lifetimeSpent).toFixed(2)}`;

  // Get all customers from the database and store it in customers array
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        data.sort((a, b) => (a.id > b.id ? 1 : -1));
        setCustomers(data);
      } catch (err) {
        setError(err);
      }
    };

    fetchCustomers();
  }, [refresh]);

  // Trigger a refresh when needed.
  const handleRefresh = () => {
    setRefresh((prev) => !prev);
  };

  // Toggle the visibility of the success modal
  const handleSuccessModal = () => {
    if (successModal) {
      setError(null);
    }
    setSuccessModal(!successModal);
  };

  const rows = [];

  // Create rows from the customer array
  customers.map((customer) =>
    rows.push(
      createRow(
        columns,
        [
          <EditCustomerModal customer={customer} onRefresh={handleRefresh} />,
          <input type='checkbox' checked={customer.active} onChange={() => {}} disabled />,
          customer.name,
          customer.emailAddress,
          formatLifetimeSpent(customer.lifetimeSpent || '0.00'),
          customer.customerSince,
          <DeleteCustomer customer={customer} onRefresh={handleRefresh} toggleSuccessModal={handleSuccessModal} />
        ],
        customer.id
      )
    )
  );

  // If there are less than 6 rows, create empty rows to fill out table
  while (rows.length < 6) {
    rows.push(createRow(columns, Array(columns.length).fill('')));
  }

  const fields = [
    { id: 'id', label: 'ID' },
    { id: 'active On', label: 'Active On' },
    { id: 'active Off', label: 'Active Off' },
    { id: 'name', label: 'Customer Name' },
    { id: 'emailAddress', label: 'Email' },
    { id: 'lifetimeSpent', label: 'Lifetime Spent' },
    { id: 'customerSince', label: 'Customer Since' }
  ];

  return (
    <>
      <div className='pages-table'>
        <div className='header-modal-container'>
          <h1 style={{ fontFamily: 'Roboto, sans-serif' }}>Customers</h1>
          <NewCustomerModal onRefresh={handleRefresh} />
        </div>
        <StickyHeadTable columns={columns} rows={rows} />
        <TableFilter
          fields={fields}
          getDomain={getCustomers}
          setDomain={setCustomers}
          setError={setError}
          onRefresh={handleRefresh}
        />
        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      </div>
      {successModal && <SuccessModal message='Customer was successfully deleted!' onClose={handleSuccessModal} />}
    </>
  );
}
