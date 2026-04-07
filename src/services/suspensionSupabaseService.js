import { supabase } from '../config/supabaseClient'

export const suspensionSupabaseService = {
  async obtenerCandidatos() {
    try {
      const { data, error } = await supabase
        .rpc('obtener_candidatos_suspension');
      
      if (error) {
        console.error('Error en obtenerCandidatos:', error);
        return { data: [], error };
      }
      
      if (!data || data.length === 0) {
        return { data: [], error: null };
      }
      
      const candidatos = data.map(item => ({
        employeename: item.employeename,
        firstabsencedate: item.fecha_falta_original,
        mondayfridaycount: item.es_lunes_viernes ? 1 : 0,
        suggesteddays: item.dias_sugeridos,
        deadline: item.deadline,
        daysRemaining: item.days_remaining,
        status: item.status,
        es_lunes_viernes: item.es_lunes_viernes
      }));
      
      return { data: candidatos, error: null };
    } catch (error) {
      console.error('Error en obtenerCandidatos:', error);
      return { data: [], error };
    }
  },

  async obtenerCandidatosBaja() {
    try {
      const { data, error } = await supabase
        .rpc('obtener_candidatos_baja');
      
      if (error) {
        console.error('Error en obtenerCandidatosBaja:', error);
        return { data: [], error };
      }
      
      const candidatos = (data || []).map(item => ({
        employeeName: item.employeename,
        absencesCount: item.absencescount,
        firstAbsenceDate: item.firstabsentcedate,
        lastAbsenceDate: item.lastabsentcedate,
        status: item.status
      }));
      
      return { data: candidatos, error: null };
    } catch (error) {
      console.error('Error en obtenerCandidatosBaja:', error);
      return { data: [], error };
    }
  },

  async obtenerNoAplicadas() {
    try {
      const { data, error } = await supabase
        .rpc('obtener_suspensiones_no_aplicadas');
      
      if (error) {
        console.error('Error en obtenerNoAplicadas:', error);
        return { data: [], error };
      }
      
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error en obtenerNoAplicadas:', error);
      return { data: [], error };
    }
  },

  // Obtener suspensiones aplicadas
// suspensionSupabaseService.js - obtenerAplicadas
async obtenerAplicadas() {
    try {
      const { data, error } = await supabase
        .from('suspensiones')
        .select('*')
        .eq('ESTADO', 'APLICADA')
        .order('FECHA_APLICACION', { ascending: false });
      
      if (error) return { data: [], error };
      
      const mappedData = (data || []).map(item => {
        // Formatear la fecha de aplicación a MM/DD/YYYY sin conversión de zona horaria
        let fechaSuspensionFormatted = '';
        if (item.FECHA_APLICACION) {
          // La fecha viene como string en formato YYYY-MM-DD desde Supabase
          const fechaStr = item.FECHA_APLICACION;
          if (fechaStr.includes('-')) {
            const [year, month, day] = fechaStr.split('-');
            fechaSuspensionFormatted = `${month}/${day}/${year}`;
          } else {
            fechaSuspensionFormatted = fechaStr;
          }
        }
        
        // Formatear la fecha de la falta original
        let fechaFaltaFormatted = '';
        if (item.FECHA) {
          const fechaStr = item.FECHA;
          if (fechaStr.includes('-')) {
            const [year, month, day] = fechaStr.split('-');
            fechaFaltaFormatted = `${month}/${day}/${year}`;
          } else {
            fechaFaltaFormatted = fechaStr;
          }
        }
        
        return {
          id: item.id,
          nombre: item.NOMBRE,
          fecha_falta: fechaFaltaFormatted,
          fecha_suspension: fechaSuspensionFormatted,
          dias: item.DIAS,
          faltas_originales: item.FALTAS_ORIGINALES,
          fechas_suspension: item.FECHAS_SUSPENSION,
          tipo_suspension: item.TIPO_SUSPENSION,
          estado: item.ESTADO
        };
      });
      
      return { data: mappedData, error: null };
    } catch (error) {
      console.error('Error en obtenerAplicadas:', error);
      return { data: [], error };
    }
  },

  async aplicarSuspension(nombre, fechaFaltaTexto, motivoFalta, fechasSuspension, dias, tipoSuspension, faltasUsadas, faltasLunesViernes, fechaInicioSuspension) {
    try {
      const partesFalta = fechaFaltaTexto.split('/');
      const fechaFaltaFormatted = `${partesFalta[2]}-${partesFalta[0].padStart(2, '0')}-${partesFalta[1].padStart(2, '0')}`;
      
      const { data, error } = await supabase
        .rpc('aplicar_suspension_completa', {
          p_nombre: nombre,
          p_fecha_falta: fechaFaltaFormatted,
          p_fecha_falta_texto: fechaFaltaTexto,
          p_motivo_falta: motivoFalta,
          p_dias: dias,
          p_fechas_suspension: fechasSuspension,
          p_tipo_suspension: tipoSuspension,
          p_faltas_usadas: faltasUsadas,
          p_faltas_lunes_viernes: faltasLunesViernes,
          p_fecha_inicio_suspension: fechaInicioSuspension
        });
      
      if (error) {
        console.error('Error en aplicarSuspension:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error en aplicarSuspension:', error);
      return { data: null, error };
    }
  },

  async eliminarSuspension(id, nombre, fechasSuspension) {
    try {
      if (fechasSuspension) {
        const fechasArray = fechasSuspension.split(',');
        for (const fecha of fechasArray) {
          const fechaTrim = fecha.trim();
          await supabase
            .from('asistencias')
            .delete()
            .eq('FECHA', fechaTrim)
            .eq('NOMBRE', nombre)
            .like('MOTIVO', 'SUSPENSION - Ref falta:%');
        }
      }
      
      const { error } = await supabase
        .from('suspensiones')
        .delete()
        .eq('id', id);
      
      if (error) return { error };
      return { error: null };
    } catch (error) {
      console.error('Error en eliminarSuspension:', error);
      return { error };
    }
  },

  async getAll() {
    try {
      const { data, error } = await supabase
        .from('suspensiones')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) return { data: [], error };
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error en getAll:', error);
      return { data: [], error };
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('suspensiones')
        .delete()
        .eq('id', id);
      
      if (error) return { error };
      return { error: null };
    } catch (error) {
      console.error('Error en delete:', error);
      return { error };
    }
  }
};