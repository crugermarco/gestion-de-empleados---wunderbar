import { supabase } from '../config/supabaseClient'

export const employeesSupabaseService = {
  async getAll() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true })
    
    if (error) {
      console.error('Error al cargar empleados:', error)
      return { error: error.message, data: null }
    }
    
    const mapped = data.map(emp => ({
      NOMBRE: emp.nombre,
      GAFETE: emp.gafete,
      'FECHA DE INGRESO': emp.fecha_ingreso,
      'NUMERO DE EMPLEADO': emp.numero_empleado,
      AREA: emp.area,
      AÑOS: emp.anos,
      'DIAS DE VACACIONES': emp.dias_vacaciones,
      id: emp.id
    }))
    
    return { error: null, data: mapped }
  },

  async add(employeeData) {
    const { data, error } = await supabase
      .from('employees')
      .insert({
        nombre: employeeData.NOMBRE,
        gafete: employeeData.GAFETE || null,
        fecha_ingreso: employeeData['FECHA DE INGRESO'] || null,
        numero_empleado: employeeData['NUMERO DE EMPLEADO'],
        area: employeeData.AREA || null,
        anos: parseFloat(employeeData.AÑOS) || 0,
        dias_vacaciones: parseFloat(employeeData['DIAS DE VACACIONES']) || 0
      })
      .select()
    
    if (error) {
      console.error('Error al agregar empleado:', error)
      return { error: error.message, data: null }
    }
    
    return { error: null, data }
  },

  async update(numeroEmpleado, employeeData) {
    const { data, error } = await supabase
      .from('employees')
      .update({
        nombre: employeeData.NOMBRE,
        gafete: employeeData.GAFETE || null,
        fecha_ingreso: employeeData['FECHA DE INGRESO'] || null,
        numero_empleado: employeeData['NUMERO DE EMPLEADO'],
        area: employeeData.AREA || null,
        anos: parseFloat(employeeData.AÑOS) || 0,
        dias_vacaciones: parseFloat(employeeData['DIAS DE VACACIONES']) || 0
      })
      .eq('numero_empleado', numeroEmpleado)
      .select()
    
    if (error) {
      console.error('Error al actualizar empleado:', error)
      return { error: error.message, data: null }
    }
    
    return { error: null, data }
  },

  async remove(numeroEmpleado) {
    const { data, error } = await supabase
      .from('employees')
      .delete()
      .eq('numero_empleado', numeroEmpleado)
      .select()
    
    if (error) {
      console.error('Error al eliminar empleado:', error)
      return { error: error.message, data: null }
    }
    
    return { error: null, data }
  },

  async search(query) {
    const { data, error } = await supabase
      .from('employees')
      .select('nombre, numero_empleado, area')
      .eq('activo', true)
      .ilike('nombre', `%${query}%`)
      .limit(10)
    
    if (error) {
      console.error('Error al buscar empleados:', error)
      return { error: error.message, data: null }
    }
    
    const mapped = data.map(emp => ({
      NOMBRE: emp.nombre,
      'NUMERO DE EMPLEADO': emp.numero_empleado,
      AREA: emp.area
    }))
    
    return { error: null, data: mapped }
  }
}