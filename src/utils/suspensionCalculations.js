import { isMondayOrFriday, isValidSuspensionDay } from './dateFormatters'

export function calculateSuggestedDays(employeeName, suspensionData) {
  const employeeSuspensions = suspensionData.filter(item => 
    item.NOMBRE === employeeName && 
    item.STATUS && 
    item.STATUS.toUpperCase() === 'REALIZADA'
  )
  const suspensionCount = employeeSuspensions.length
  
  if (suspensionCount === 0) return 1
  if (suspensionCount === 1) return 2
  if (suspensionCount === 2) return 3
  
  return Math.min(suspensionCount + 1, 8)
}

export function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

export function getSuspensionDates(suggestedDays, firstAbsenceDate) {
  const dates = []
  const startDate = new Date(firstAbsenceDate)
  let currentDate = new Date(startDate)
  const usedWeeks = new Set()
  
  while (dates.length < suggestedDays) {
    currentDate.setDate(currentDate.getDate() + 1)
    
    if (isValidSuspensionDay(currentDate)) {
      const weekNumber = getWeekNumber(currentDate)
      const weekKey = `${currentDate.getFullYear()}-${weekNumber}`
      
      if (suggestedDays >= 6 || !usedWeeks.has(weekKey)) {
        dates.push(new Date(currentDate))
        usedWeeks.add(weekKey)
      }
    }
  }
  
  return dates.slice(0, suggestedDays)
}

export function updateSuspensionStatuses(suspensionData) {
  const suspensionCandidates = []
  const notAppliedSuspensions = []
  const appliedSuspensions = []
  const automaticDismissalCandidates = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const employeesMap = new Map()

  suspensionData.forEach(suspension => {
    if (!suspension.FECHA || !suspension.NOMBRE) return
    
    const employeeName = suspension.NOMBRE
    if (!employeesMap.has(employeeName)) {
      employeesMap.set(employeeName, [])
    }
    employeesMap.get(employeeName).push(suspension)
  })

  for (const [employeeName, suspensions] of employeesMap) {
    const validSuspensions = suspensions.filter(s => s.FECHA && s.NOMBRE)
    
    validSuspensions.forEach(suspension => {
      const absenceDate = new Date(suspension.FECHA)
      absenceDate.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor((today - absenceDate) / (1000 * 60 * 60 * 24))
      const status = suspension.STATUS || 'PENDIENTE'
      const isApplied = status.toUpperCase() === 'REALIZADA'

      if (isApplied) {
        appliedSuspensions.push({
          employeeName: suspension.NOMBRE,
          suspensionDate: suspension['FECHA DE APLICACION'] || suspension.FECHA,
          days: calculateSuggestedDays(suspension.NOMBRE, suspensionData),
          originalAbsences: '1 falta',
          absenceDate: suspension.FECHA
        })
        return
      }

      if (daysDiff > 30) {
        notAppliedSuspensions.push({
          employeeName: suspension.NOMBRE,
          firstAbsenceDate: suspension.FECHA,
          deadline: new Date(absenceDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          status: 'NO APLICADA',
          absenceDate: suspension.FECHA
        })
        return
      }

      if (daysDiff <= 30) {
        const employeeAbsencesLast30Days = validSuspensions.filter(item => {
          const itemDate = new Date(item.FECHA)
          itemDate.setHours(0, 0, 0, 0)
          const itemDaysDiff = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24))
          return itemDaysDiff <= 30
        })

        if (employeeAbsencesLast30Days.length >= 4) {
          const firstAbsence = employeeAbsencesLast30Days.reduce((earliest, current) => {
            return new Date(current.FECHA) < new Date(earliest.FECHA) ? current : earliest
          })
          
          const lastAbsence = employeeAbsencesLast30Days.reduce((latest, current) => {
            return new Date(current.FECHA) > new Date(latest.FECHA) ? current : latest
          })

          const alreadyInDismissal = automaticDismissalCandidates.some(
            candidate => candidate.employeeName === employeeName
          )

          if (!alreadyInDismissal) {
            automaticDismissalCandidates.push({
              employeeName: employeeName,
              firstAbsenceDate: firstAbsence.FECHA,
              lastAbsenceDate: lastAbsence.FECHA,
              absencesCount: employeeAbsencesLast30Days.length,
              status: 'BAJA'
            })
          }
          return
        }

        const mondayFridayCount = validSuspensions.filter(item => 
          isMondayOrFriday(item.FECHA)
        ).length

        const alreadyInCandidates = suspensionCandidates.some(
          candidate => candidate.employeeName === employeeName && 
          candidate.firstAbsenceDate === suspension.FECHA
        )

        if (!alreadyInCandidates) {
          suspensionCandidates.push({
            employeeName: suspension.NOMBRE,
            firstAbsenceDate: suspension.FECHA,
            absencesCount: 1,
            mondayFridayCount: mondayFridayCount,
            suggestedDays: calculateSuggestedDays(suspension.NOMBRE, suspensionData),
            status: 'PENDIENTE',
            absencesData: [suspension],
            deadline: new Date(absenceDate.getTime() + 30 * 24 * 60 * 60 * 1000)
          })
        }
      }
    })
  }

  return { suspensionCandidates, notAppliedSuspensions, appliedSuspensions, automaticDismissalCandidates }
}