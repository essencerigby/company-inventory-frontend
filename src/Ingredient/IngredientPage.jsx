/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable object-curly-newline */
import React, { useEffect, useState } from 'react';
import '../index.css';
import '../Component/Modal.css';
import StickyHeadTable, { createRow } from '../Component/Table';
import { getIngredients, createIngredient, getIngredientById, deleteIngredient } from '../apiService';
import ReusableModal from '../Component/ReusableModal';
import ReusableDeleteModal from '../Component/ReusableDeleteModal';
import SuccessModal from '../Component/SuccessModal';
import { ingredientValidation } from '../Validation';
import { ingredientFormatting } from '../Formatting';
import TableFilter from '../Component/TableFilter';

/**
 *  * IngredientPage Component
 *
 * This component is responsible for displaying a table of ingredients retrieved from the backend.
 * It utilizes the Table component for the table structure. The component fetches ingredient data
 * using an asynchronous call to getingredients and handles potential errors.
 *
 * Functionality:
 * - Defines columns for the table, specifying the column ID, label, and minimum width
 * - Manages state for ingredients data and error handling
 * - Fetches ingredient data when the component mounts using useEffect, and updates state
 * - Dynamically creates rows for the table from the fetched ingredients data
 * - Displays the table with ingredients data and handles errors by displaying any errors
 *
 * @returns {JSX.Element} A React component that displays a ingredient page
 */

export default function IngredientPage() {
  const columns = [
    { id: 'id', label: 'ID', minWidth: 50, type: 'none', formOrder: 0 },
    { id: 'name', label: 'Name', minWidth: 100, type: 'text', formOrder: 2, required: true },
    { id: 'active', label: 'Active', minWidth: 100, type: 'checkbox', formOrder: 1 },
    {
      id: 'purchasingCost',
      label: 'Purchasing Cost',
      minWidth: 100,
      type: 'numericDollar',
      formOrder: 5,
      required: true
    },
    { id: 'amount', label: 'Unit Amount', minWidth: 100, type: 'numeric', formOrder: 3, gridNum: 1, required: true },
    {
      id: 'unitOfMeasure',
      label: 'Measurement',
      minWidth: 100,
      type: 'dropdown',
      formOrder: 4,
      gridNum: 2,
      required: true
    },
    { id: 'allergens', label: 'Allergens', minWidth: 100, type: 'multiselect', formOrder: 6 },
    { id: 'deleteIcon', label: '', minWidth: 40, type: 'none', formOrder: 0 }
  ];

  const temporaryFields = [
    { id: 'id', label: 'ID' },
    { id: 'active On', label: 'Active On', keys: 'active' },
    { id: 'active Off', label: 'Active Off', keys: 'active' },
    { id: 'name', label: 'Name', keys: 'name' },
    { id: 'purchasingCost', label: 'Purchasing Cost', key: 'purchasingCost' },
    { id: 'amount', label: 'Unit Amount', keys: 'amount' },
    { id: 'unitOfMeasurement', label: 'Unit of Measurement', keys: 'unitOfMeasurement' },
    { id: 'allergens', label: 'Allergens', keys: 'allergens' }
  ];

  const [ingredients, setIngredients] = useState([]);
  const [error, setError] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // Updating data display in table upon change in ingredients data provided by backend
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const data = await getIngredients();
        data.sort((a, b) => (a.id > b.id ? 1 : -1));
        setIngredients(data);
      } catch (err) {
        setError(err);
      }
    };
    fetchIngredients();
  }, [refresh]);

  // Toggles the refresh state, to trigger a refresh when a new vendor is successfully submitted.
  const handleRefresh = () => {
    setRefresh((prev) => !prev);
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const formatList = (list) => (list ? list.join(', ') : '');

  const displayDash = (value) => (value === '' || value.toLowerCase() === 'n/a' ? '-' : value);

  const handleOpenSuccessModal = () => {
    if (successModal) {
      setError(null);
    }
    setSuccessModal(true);
  };

  const handleCloseSuccessModal = () => {
    if (successModal) {
      setError(null);
    }
    setSuccessModal(false);
  };

  const rows = [];

  // Mapping ingredient data from API response body to column/row data
  ingredients.map((ingredient) =>
    rows.push(
      createRow(columns, [
        ingredient.id,
        ingredient.name,
        <input type='checkbox' checked={ingredient.active} onChange={() => {}} disabled id={ingredient.id} />,
        formatPrice(ingredient.purchasingCost),
        ingredient.amount,
        ingredient.unitOfMeasure,
        displayDash(formatList(ingredient.allergens)),
        <ReusableDeleteModal
          id={ingredient.id}
          domain='ingredient'
          onRefresh={handleRefresh}
          toggleSuccessModal={handleOpenSuccessModal}
          getObjectById={getIngredientById}
          deleteObject={deleteIngredient}
        />
      ])
    )
  );

  // If there are less than 6 rows, create empty rows to fill out table
  while (rows.length < 6) {
    rows.push(createRow(columns, Array(columns.length).fill('')));
  }

  // Props that get passed into the reusable modal
  const unitOfMeasure = ['OZ', 'LB', 'KG', 'ML', 'TSP', 'TBSP', 'CUPS'];
  const allergenList = ['Dairy', 'Gluten', 'Nuts', 'Soy'];
  const style = {
    modalStyling: { gridTemplateColumns: '1fr 1fr 1fr', maxWidth: '400px' },
    xButtonError: { transform: 'translateY(-130%)' }
  };
  return (
    <div className='pages-table'>
      <div className='header-modal-container'>
        <h1 style={{ fontFamily: 'Roboto, sans-serif' }}>Ingredients</h1>
        <ReusableModal
          fields={columns}
          header='NEW INGREDIENT FORM'
          dropDownOptions={unitOfMeasure}
          multiSelectOptions={allergenList}
          onRefresh={handleRefresh}
          createObject={createIngredient}
          validation={ingredientValidation}
          format={ingredientFormatting}
          style={style}
        />
      </div>
      {successModal && (
        <SuccessModal message='Ingredient was successfully deleted!' onClose={handleCloseSuccessModal} />
      )}
      <StickyHeadTable columns={columns} rows={rows} />
      <TableFilter
        fields={temporaryFields}
        domainToSearch={ingredients}
        getDomain={getIngredients}
        setDomain={setIngredients}
        setError={setError}
        onRefresh={handleRefresh}
      />
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
    </div>
  );
}
