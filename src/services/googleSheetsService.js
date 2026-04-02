import { sheetConnections } from '../config/sheetConfig'


export async function fetchSheetData(connection, action = 'read', data = null) {
  try {
    const url = new URL(connection.scriptUrl)
    url.searchParams.append('id', connection.spreadsheetId)
    url.searchParams.append('sheet', connection.sheetName)
    url.searchParams.append('action', action)
    
    if (data) {
      if (action === 'update' || action === 'delete') {
        url.searchParams.append('data', JSON.stringify(data))
      } else {
        const formattedData = Array.isArray(data) ? data : [data]
        const finalData = formattedData.map(item => {
          const formattedItem = {...item}
          if ('AUTORIZADAS' in formattedItem) {
            formattedItem.AUTORIZADAS = formattedItem.AUTORIZADAS ? 'TRUE' : 'FALSE'
          }
          return formattedItem
        })
        url.searchParams.append('data', JSON.stringify(finalData))
      }
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      mode: 'cors'
    })
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    return result
  } catch (error) {
    console.error('Error en fetchSheetData:', error)
    return { error: error.message }
  }
}

export const googleSheetsService = {
  getAttendance: () => fetchSheetData(sheetConnections.productivity),
  addAttendance: (record) => fetchSheetData(sheetConnections.productivity, 'append', [record]),
  getVacations: () => fetchSheetData(sheetConnections.vacations),
  addVacation: (record) => fetchSheetData(sheetConnections.vacations, 'append', [record]),
  updateVacation: (original, updated) => fetchSheetData(sheetConnections.vacations, 'update', { original, updated }),
  deleteVacation: (record) => fetchSheetData(sheetConnections.vacations, 'delete', record),
  getEmployees: () => fetchSheetData(sheetConnections.employees),
  addEmployee: (record) => fetchSheetData(sheetConnections.employees, 'append', [record]),
  updateEmployee: (original, updated) => fetchSheetData(sheetConnections.employees, 'update', { original, updated }),
  deleteEmployee: (record) => fetchSheetData(sheetConnections.employees, 'delete', record),
  getSuspensions: () => fetchSheetData(sheetConnections.suspensionConcentrado),
  addSuspension: (record) => fetchSheetData(sheetConnections.suspensionConcentrado, 'append', [record]),
  updateSuspension: (record) => fetchSheetData(sheetConnections.suspensionConcentrado, 'update', record),
  getNonWorkingDays: () => fetchSheetData(sheetConnections.nonWorkingDays),
  getRotation: () => fetchSheetData(sheetConnections.rotation),
  addPermission: (record) => fetchSheetData(sheetConnections.permissions, 'append', [record]),
  addSuspensionForm: (record) => fetchSheetData(sheetConnections.suspensionFormato, 'append', [record])
};