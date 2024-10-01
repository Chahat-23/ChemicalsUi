let chemicalsData = [];
let currentSort = { column: 'id', direction: 'asc' };
let originalData = []; 
let editingCell = null;

async function loadChemicalsData() {
    try {
        const response = await fetch('chemicals.json');
        chemicalsData = await response.json();
        originalData = JSON.parse(JSON.stringify(chemicalsData)); // Deep copy
        renderTable();
    } catch (error) {
        console.error('Error loading chemicals data:', error);
    }
}

function renderTable() {
    const tbody = document.querySelector('#chemicalsTable tbody');
    const selectedRows = Array.from(tbody.querySelectorAll('tr.selected')).map(row => row.rowIndex - 1);
    
    tbody.innerHTML = '';

    // Update the table header
    const thead = document.querySelector('#chemicalsTable thead');
    thead.innerHTML = `
        <tr>
            <th>
                <div class="header-content">
                    <div class="custom-checkbox">
                        <input type="checkbox" id="selectAll">
                        <label for="selectAll"></label>
                    </div>
                    <span>ID</span>
                    <span>Chemical name</span>
                </div>
            </th>
            <th>Vendor</th>
            <th>Density<br><span class="unit">g/m³</span></th>
            <th>Viscosity<br><span class="unit">m²/s</span></th>
            <th>Packaging</th>
            <th>Pack size</th>
            <th>Unit</th>
            <th>Quantity</th>
        </tr>
    `;

    chemicalsData.forEach((chemical, index) => {
        const tr = document.createElement('tr');
        if (selectedRows.includes(index)) {
            tr.classList.add('selected');
        }
        
        tr.innerHTML = `
            <td>
                <div class="cell-content">
                    <div class="custom-checkbox">
                        <input type="checkbox" class="row-checkbox" id="checkbox-${index}">
                        <label for="checkbox-${index}"></label>
                    </div>
                    <span>${chemical.id}</span>
                    <span>${chemical.chemicalName}</span>
                </div>
            </td>
            <td>${chemical.vendor}</td>
            <td>${chemical.density.toFixed(2)}</td>
            <td>${chemical.viscosity.toFixed(2)}</td>
            <td>${chemical.packaging}</td>
            <td>${chemical.packSize.toFixed(2)}</td>
            <td>${chemical.unit}</td>
            <td>${chemical.quantity.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });

    handleSelectAll();
    handleRowSelection();
}

function updateMoveButtons() {
    const moveUpButton = document.getElementById('moveUp');
    const moveDownButton = document.getElementById('moveDown');
    const selectedRows = document.querySelectorAll('#chemicalsTable tbody tr.selected');
    const allRows = document.querySelectorAll('#chemicalsTable tbody tr');

    moveUpButton.disabled = selectedRows.length !== 1 || selectedRows[0] === allRows[0];
    moveDownButton.disabled = selectedRows.length !== 1 || selectedRows[0] === allRows[allRows.length - 1];
}

function handleRowSelection() {
    const tbody = document.querySelector('#chemicalsTable tbody');

    tbody.addEventListener('click', (event) => {
        const checkbox = event.target.closest('.custom-checkbox input');
        if (checkbox) {
            const row = checkbox.closest('tr');
            row.classList.toggle('selected', checkbox.checked);
            updateMoveButtons();
        }

        const cell = event.target.closest('td');
        if (cell && cell.closest('tr').classList.contains('selected') && 
            (cell.cellIndex === 2 || cell.cellIndex === 3 || cell.cellIndex === 7)) { // Density, Viscosity, Quantity
            startEditing(cell);
        }
    });

    document.addEventListener('click', (event) => {
        if (editingCell && !editingCell.contains(event.target)) {
            saveEdit();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && editingCell) {
            saveEdit();
        }
    });
}

function makeRowEditable(row, editable) {
    const editableCells = row.querySelectorAll('td:nth-child(3), td:nth-child(4), td:nth-child(8)');
    editableCells.forEach(cell => {
        cell.classList.toggle('editable', editable);
    });
}

function startEditing(cell) {
    if (editingCell) saveEdit();
    editingCell = cell;
    const value = cell.querySelector('.value').textContent;
    const unit = cell.querySelector('.unit').textContent;
    cell.innerHTML = `<input type="text" class="edit-input" value="${value}"><span class="unit">${unit}</span>`;
    cell.classList.add('editing');
    const input = cell.querySelector('input');
    input.focus();
    input.setSelectionRange(0, input.value.length);
}

function saveEdit() {
    if (!editingCell) return;
    
    const input = editingCell.querySelector('input');
    const unit = editingCell.querySelector('.unit').textContent;
    const newValue = input.value;
    
    editingCell.innerHTML = `<span class="value">${newValue}</span> <span class="unit">${unit}</span>`;
    editingCell.classList.remove('editing');
    
    // Here you would typically update your data structure (chemicalsData)
    // For example:
    // const row = editingCell.closest('tr');
    // const rowIndex = Array.from(row.parentNode.children).indexOf(row);
    // const cellIndex = editingCell.cellIndex;
    // Update chemicalsData[rowIndex] with the new value for the appropriate property
    
    editingCell = null;
}

function updateMoveButtons() {
    const moveUpButton = document.getElementById('moveUp');
    const moveDownButton = document.getElementById('moveDown');
    const selectedRows = document.querySelectorAll('#chemicalsTable tbody tr.selected');
    const allRows = document.querySelectorAll('#chemicalsTable tbody tr');

    moveUpButton.disabled = selectedRows.length !== 1 || selectedRows[0] === allRows[0];
    moveDownButton.disabled = selectedRows.length !== 1 || selectedRows[0] === allRows[allRows.length - 1];
}

function handleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const rows = document.querySelectorAll('#chemicalsTable tbody tr');

    selectAllCheckbox.addEventListener('change', () => {
        rowCheckboxes.forEach((checkbox, index) => {
            checkbox.checked = selectAllCheckbox.checked;
            rows[index].classList.toggle('selected', selectAllCheckbox.checked);
        });
        updateMoveButtons();
    });
}

function moveUp() {
    const selectedRow = document.querySelector('.row-checkbox:checked');
    if (selectedRow) {
        const rowIndex = selectedRow.closest('tr').rowIndex - 1; // Adjust for header row
        if (rowIndex > 0) {
            [chemicalsData[rowIndex - 1], chemicalsData[rowIndex]] = [chemicalsData[rowIndex], chemicalsData[rowIndex - 1]];
            renderTable();
        }
    }
}

function moveDown() {
    const selectedRow = document.querySelector('.row-checkbox:checked');
    if (selectedRow) {
        const rowIndex = selectedRow.closest('tr').rowIndex - 1; // Adjust for header row
        if (rowIndex < chemicalsData.length - 1) {
            [chemicalsData[rowIndex], chemicalsData[rowIndex + 1]] = [chemicalsData[rowIndex + 1], chemicalsData[rowIndex]];
            renderTable();
        }
    }
}

function undoChanges() {
    chemicalsData = JSON.parse(JSON.stringify(originalData)); // Deep copy
    renderTable();
}

function saveChanges() {
    console.log('Saving changes:', chemicalsData);
    alert('Changes saved!');
}

function deleteRow() {
    const selectedCheckbox = document.querySelector('.row-checkbox:checked');
    if (selectedCheckbox) {
        const rowIndex = Array.from(selectedCheckbox.closest('tbody').children).indexOf(selectedCheckbox.closest('tr'));
        chemicalsData.splice(rowIndex, 1);
        renderTable();
        updateMoveButtons();
    }
}

function addRow() {
    const newChemical = {
        id: chemicalsData.length + 1,
        chemicalName: "New Chemical",
        vendor: "New Vendor",
        density: 0,
        viscosity: 0,
        packaging: "N/A",
        packSize: 0,
        unit: "N/A",
        quantity: 0
    };
    chemicalsData.push(newChemical);
    renderTable();
    updateMoveButtons();
}

function saveEditedValues() {
    const selectedRow = document.querySelector('#chemicalsTable tbody tr.selected');
    if (selectedRow) {
        const rowIndex = Array.from(selectedRow.parentNode.children).indexOf(selectedRow);
        const inputs = selectedRow.querySelectorAll('.edit-input');
        
        inputs.forEach((input, cellIndex) => {
            const propertyName = Object.keys(chemicalsData[rowIndex])[cellIndex + 2]; // +2 to skip id and chemicalName
            chemicalsData[rowIndex][propertyName] = input.value;
        });

        renderTable();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadChemicalsData().then(() => {
        renderTable();
        handleRowSelection();
        handleSelectAll();
        
        // Check if styles are being applied correctly
        const styleTest = document.createElement('div');
        styleTest.style.display = 'none';
        styleTest.classList.add('selected');
        document.body.appendChild(styleTest);
        const computedStyle = window.getComputedStyle(styleTest);
        console.log('Selected background-color:', computedStyle.backgroundColor);
        document.body.removeChild(styleTest);
    });

    document.getElementById('addRow').addEventListener('click', addRow);
    document.getElementById('moveUp').addEventListener('click', moveUp);
    document.getElementById('moveDown').addEventListener('click', moveDown);
    document.getElementById('deleteRow').addEventListener('click', deleteRow);
    document.getElementById('undoChanges').addEventListener('click', undoChanges);
    document.getElementById('saveChanges').addEventListener('click', saveChanges);

    document.addEventListener('click', (event) => {
        if (!event.target.closest('#chemicalsTable')) {
            saveEditedValues();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            saveEditedValues();
        }
    });

    handleTableInteractions();
});

function handleTableInteractions() {
    const table = document.getElementById('chemicalsTable');

    table.addEventListener('click', (event) => {
        const cell = event.target.closest('td');
        if (cell && (cell.cellIndex === 2 || cell.cellIndex === 3 || cell.cellIndex === 7)) { // Density, Viscosity, Quantity
            startEditing(cell);
        }
    });

    document.addEventListener('click', (event) => {
        if (editingCell && !editingCell.contains(event.target)) {
            saveEdit();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && editingCell) {
            saveEdit();
        }
    });
}

function startEditing(cell) {
    if (editingCell) saveEdit();
    editingCell = cell;
    const value = cell.querySelector('.value').textContent;
    const unit = cell.querySelector('.unit').textContent;
    cell.innerHTML = `<input type="text" class="edit-input" value="${value}"><span class="unit">${unit}</span>`;
    cell.classList.add('editing');
    const input = cell.querySelector('input');
    input.focus();
    input.setSelectionRange(0, input.value.length);
}

function saveEdit() {
    if (!editingCell) return;
    
    const input = editingCell.querySelector('input');
    const unit = editingCell.querySelector('.unit').textContent;
    const newValue = input.value;
    
    editingCell.innerHTML = `<span class="value">${newValue}</span> <span class="unit">${unit}</span>`;
    editingCell.classList.remove('editing');
    
    console.log('Saved edit:', newValue); // For debugging
    
    editingCell = null;
}

// Make sure to call handleTableInteractions() when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    handleTableInteractions();
});