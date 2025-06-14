import ExcelJS from 'exceljs';

export interface GridExportOptions {
    sheetTitle: string,
    workBookTitle: string
}

export async function exportToExcel(gridData: any, exportOptions: GridExportOptions) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(exportOptions.sheetTitle ?? 'New');

    const dataObjectColumns = gridData.columns.map(column => ({
        header: column.colName,
        key: column.field,
        width: (getColumnWidthNumber(column.width) / 10),
        columnType: column.type,
        alignment:{ horizontal: 'right' }
    }));

    worksheet.columns = dataObjectColumns;

    // Populate the worksheet with data
    gridData.data.forEach(row => {
        const rowData = dataObjectColumns.reduce((acc, col) => {
            let value = row[col.key] ?? ''; // Default to empty if value is not found

            acc[col.key] = value;
            return acc;
        }, {} as Record<string, any>);

        worksheet.addRow(rowData);
    });

    // Write workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create a Blob from the buffer
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportOptions.workBookTitle ?? 'Grid_Data'}.xlsx`;

    // Append to body, trigger click, and remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Release object URL
    URL.revokeObjectURL(url);
    // Save to file
}

function getColumnWidthNumber(width: string): number {
    return width.replace(/\D/g, "");
}