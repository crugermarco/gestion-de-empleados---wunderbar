import { supabase } from '../config/supabaseClient'

export const vacationsSupabaseService = {
  async getAll() {
    const { data, error } = await supabase
      .from('vacaciones')
      .select('*')
      .order('id', { ascending: false })
    
    if (error) throw error
    return { data, error: null }
  },

  async add(vacationRecord) {
    const { data, error } = await supabase
      .from('vacaciones')
      .insert([vacationRecord])
      .select()
    
    if (error) throw error
    return { data: data[0], error: null }
  },

  async updateAuthorization(id, isAuthorized) {
    const { data, error } = await supabase
      .from('vacaciones')
      .update({ AUTORIZADAS: isAuthorized })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return { data: data[0], error: null }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('vacaciones')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return { data: data[0], error: null }
  },

  async delete(id) {
    const { error } = await supabase
      .from('vacaciones')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { error: null }
  },

  async getByArea(area) {
    const { data, error } = await supabase
      .from('vacaciones')
      .select('*')
      .eq('ÁREA', area)
      .order('FECHA SALIDA', { ascending: true })
    
    if (error) throw error
    return { data, error: null }
  }
}