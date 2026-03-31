export const sheetConnections = {
  productivity: {
    scriptUrl: import.meta.env.VITE_PRODUCTIVITY_SCRIPT_URL,
    spreadsheetId: import.meta.env.VITE_PRODUCTIVITY_SPREADSHEET_ID,
    sheetName: 'Productivity Bonus 2025'
  },
  vacations: {
    scriptUrl: import.meta.env.VITE_VACATIONS_SCRIPT_URL,
    spreadsheetId: import.meta.env.VITE_VACATIONS_SPREADSHEET_ID,
    sheetName: 'CONCENTRADO DE VACACIONES'
  },
  nonWorkingDays: {
    scriptUrl: import.meta.env.VITE_VACATIONS_SCRIPT_URL,
    spreadsheetId: import.meta.env.VITE_VACATIONS_SPREADSHEET_ID,
    sheetName: 'DIAS NO LABORABLES'
  },
  employees: {
    scriptUrl: import.meta.env.VITE_EMPLOYEES_SCRIPT_URL,
    spreadsheetId: import.meta.env.VITE_EMPLOYEES_SPREADSHEET_ID,
    sheetName: 'DATA'
  },
  permissions: {
    scriptUrl: import.meta.env.VITE_PERMISSIONS_SCRIPT_URL,
    spreadsheetId: import.meta.env.VITE_PERMISSIONS_SPREADSHEET_ID,
    sheetName: 'FORMATO'
  },
  suspensionConcentrado: {
    scriptUrl: import.meta.env.VITE_SUSPENSION_SCRIPT_URL,
    spreadsheetId: import.meta.env.VITE_SUSPENSION_SPREADSHEET_ID,
    sheetName: 'CONCENTRADO DE SUSPENCIONES'
  },
  suspensionFormato: {
    scriptUrl: import.meta.env.VITE_SUSPENSION_SCRIPT_URL,
    spreadsheetId: import.meta.env.VITE_SUSPENSION_SPREADSHEET_ID,
    sheetName: 'SUSPENCION'
  },
  vacationFormato: {
    scriptUrl: import.meta.env.VITE_VACATIONS_SCRIPT_URL,
    spreadsheetId: import.meta.env.VITE_VACATIONS_SPREADSHEET_ID,
    sheetName: 'FORMATO DE VACACIONES'
  },
  rotation: {
    scriptUrl: import.meta.env.VITE_ROTATION_SCRIPT_URL,
    spreadsheetId: import.meta.env.VITE_ROTATION_SPREADSHEET_ID,
    sheetName: 'REGISTRO'
  }
};

export const columnMappingVacation = {
  'NOMBRE': 'A',
  'FECHA DE INGRESO': 'B',
  'NUMERO DE EMPLEADO': 'C',
  'ÁREA': 'D',
  'DÍAS VACACIONES': 'E',
  'FECHA DE PAGO': 'F',
  'FECHA SALIDA': 'G',
  'FECHA REGRESO': 'H',
  'AUTORIZADAS': 'I',
  'DÍAS TOMADOS': 'J',
  'GUARDAR DICIEMBRE': 'K'
};