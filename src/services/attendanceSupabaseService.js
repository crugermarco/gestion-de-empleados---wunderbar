import { supabase } from '../config/supabaseClient'

export const attendanceSupabaseService = {
  async getAll() {
    const { data, error } = await supabase
      .from('asistencias')
      .select('*')
      .order('id', { ascending: false })  // Los IDs más altos (fechas más recientes) primero
    
    if (error) throw error
    
    return { data, error: null }  // Ya no necesitas ordenar manualmente
  },

  async add(attendanceRecord) {
    const cleanedRecord = {
      FECHA: (attendanceRecord.FECHA || '').substring(0, 20),
      NOMBRE: (attendanceRecord.NOMBRE || '').substring(0, 200),
      MOTIVO: (attendanceRecord.MOTIVO || '').substring(0, 100),
      PUNTOS: (attendanceRecord.PUNTOS || '0').substring(0, 20)
    }
    
    const { data, error } = await supabase
      .from('asistencias')
      .insert([cleanedRecord])
      .select()
    
    if (error) throw error
    return { data: data[0], error: null }
  },

  async update(id, updates) {
    const cleanedUpdates = {
      FECHA: (updates.FECHA || '').substring(0, 20),
      NOMBRE: (updates.NOMBRE || '').substring(0, 200),
      MOTIVO: (updates.MOTIVO || '').substring(0, 100),
      PUNTOS: (updates.PUNTOS || '0').substring(0, 20)
    }
    
    const { data, error } = await supabase
      .from('asistencias')
      .update(cleanedUpdates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return { data: data[0], error: null }
  },

  async delete(id) {
    const { error } = await supabase
      .from('asistencias')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { error: null }
  }
}