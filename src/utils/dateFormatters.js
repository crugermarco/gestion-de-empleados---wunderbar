export function formatDate(dateString) {
  if (!dateString) return ''
  
  if (typeof dateString === 'string' && dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    return dateString
  }
  
  try {
    if (typeof dateString === 'string' && dateString.startsWith('Date(')) {
      const dateParts = dateString.match(/\d+/g)
      if (dateParts && dateParts.length >= 3) {
        return `${dateParts[1].padStart(2, '0')}/${dateParts[2].padStart(2, '0')}/${dateParts[0]}`
      }
    }
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const year = date.getFullYear()
    
    return `${month}/${day}/${year}`
  } catch (e) {
    return dateString
  }
}

export function formatDateForInput(dateString) {
  if (!dateString) return ''
  
  try {
    if (typeof dateString === 'string' && dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)) {
      const [month, day, year] = dateString.split('/').map(Number)
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    }
    
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString
    }
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (e) {
    return ''
  }
}

export function formatDateForSheet(dateString) {
  if (!dateString) return ''
  
  try {
    if (typeof dateString === 'string' && dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)) {
      const [part1, part2, year] = dateString.split('/').map(Number)
      
      if (part1 > 12 && part2 <= 12) {
        return `${part2.toString().padStart(2, '0')}/${part1.toString().padStart(2, '0')}/${year}`
      }
      
      if (part1 <= 12 && part2 <= 12) {
        return `${part1.toString().padStart(2, '0')}/${part2.toString().padStart(2, '0')}/${year}`
      }
    }
    
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-')
      return `${month}/${day}/${year}`
    }
    
    return dateString
    
  } catch (e) {
    return dateString
  }
}

export function getMonthName(monthNumber) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[parseInt(monthNumber) - 1] || ''
}

export function getMonthNumber(monthName) {
  const months = {
    'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
    'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
    'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
  }
  return months[monthName.toLowerCase()] || ''
}

export function isMondayOrFriday(dateString) {
  try {
    const date = new Date(dateString)
    const dayOfWeek = date.getDay()
    return dayOfWeek === 1 || dayOfWeek === 5
  } catch (e) {
    return false
  }
}

export function isValidSuspensionDay(dateString) {
  try {
    const date = new Date(dateString)
    const dayOfWeek = date.getDay()
    return dayOfWeek >= 1 && dayOfWeek <= 5
  } catch (e) {
    return false
  }
}

export function isNonWorkingDay(date) {
  if (!date) return false;
  
  try {
    let year, month, day;
    
    if (typeof date === 'string' && date.includes('-')) {
      const parts = date.split('-');
      if (parts.length === 3) {
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
        day = parseInt(parts[2]);
      }
    } else {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return false;
      year = dateObj.getFullYear();
      month = dateObj.getMonth() + 1;
      day = dateObj.getDate();
    }
    
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return true;
    }
    
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `${monthStr}/${dayStr}/${year}`;
    
    const specificNonWorkingDays = [
      '01/01/2026',
      '02/02/2026',
      '03/16/2026',
      '04/03/2026', 
      '05/01/2026',
      '09/16/2026',
      '11/16/2026',
      '12/25/2026',
      '01/01/2027'
    ];
    
    if (specificNonWorkingDays.includes(dateStr)) {
      return true;
    }
    
    return false;
  } catch (e) {
    return false;
  }
}

export function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

export function convertTo12Hour(time24) {
  if (!time24) return ''
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function convertTo24Hour(time12) {
  if (!time12) return ''
  const [time, ampm] = time12.split(' ')
  const [hours, minutes] = time.split(':')
  let hour = parseInt(hours)
  if (ampm === 'PM' && hour < 12) hour += 12
  if (ampm === 'AM' && hour === 12) hour = 0
  return `${hour.toString().padStart(2, '0')}:${minutes}`
}