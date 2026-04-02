import { jsPDF } from 'jspdf'

// Función para cargar imagen como base64
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL('image/png')
      resolve(dataURL)
    }
    img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${url}`))
    img.src = url
  })
}

export async function generateVacationPDFDirect(vacationData) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    })
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 25
    
    const today = new Date()
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    const diaSemana = diasSemana[today.getDay()]
    const dia = today.getDate()
    const mes = meses[today.getMonth()]
    const anio = today.getFullYear()
    const fechaHoy = `${diaSemana}, ${dia} de ${mes} de ${anio}`
    
    const logoHeight = 20
    const logoWidth = 40
    const logoTopMargin = 15
    
    // Intentar cargar los logos
    try {
      const leftLogoUrl = '/logos/ivemsa.png'
      const leftLogoBase64 = await loadImageAsBase64(leftLogoUrl)
      doc.addImage(leftLogoBase64, 'PNG', margin, logoTopMargin, logoWidth, logoHeight)
    } catch (error) {
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text('IVEMSA', margin + 10, logoTopMargin + 10)
    }
    
    try {
      const rightLogoUrl = '/logos/wunderbar.png'
      const rightLogoBase64 = await loadImageAsBase64(rightLogoUrl)
      doc.addImage(rightLogoBase64, 'PNG', pageWidth - margin - logoWidth, logoTopMargin, logoWidth, logoHeight)
    } catch (error) {
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text('Wunderbar', pageWidth - margin - 20, logoTopMargin + 10)
    }
    
    const headerYPos = logoTopMargin + logoHeight + 10
    
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('VACACIONES', pageWidth / 2, headerYPos, { align: 'center' })
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Ensenada, B.C., ${fechaHoy}`, margin, headerYPos + 10)
    
    let yPos = headerYPos + 25
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Para:', margin, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text('RECURSOS HUMANOS', margin + 20, yPos)
    
    yPos += 8
    doc.setFont('helvetica', 'bold')
    doc.text('De:', margin, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text('Omar Arreola Meza', margin + 20, yPos)
    
    yPos += 12
    doc.setFont('helvetica', 'normal')
    doc.text('Por medio de la presente le solicitamos le sean procesadas las vacaciones a:', margin, yPos)
    
    yPos += 12
    doc.setFont('helvetica', 'bold')
    doc.text('Nombre:', margin, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(vacationData.nombre || ''), margin + 25, yPos)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Numero de Empleado:', pageWidth / 2 + 10, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(vacationData.numeroEmpleado || ''), pageWidth / 2 + 55, yPos)
    
    yPos += 10
    doc.setFont('helvetica', 'bold')
    doc.text('Fecha de ingreso:', margin, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(vacationData.fechaIngreso || ''), margin + 42, yPos)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Dias a gozar:', margin + 85, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(vacationData.diasTomados || '0'), margin + 115, yPos)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Dias a pagar:', margin + 135, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(vacationData.diasTomados || '0'), margin + 165, yPos)
    
    yPos += 10
    doc.setFont('helvetica', 'bold')
    doc.text('Fecha de pago de vacaciones:', margin, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(vacationData.fechaPago || ''), margin + 75, yPos)
    
    yPos += 10
    doc.setFont('helvetica', 'bold')
    doc.text('Fecha de Inicio de Vacaciones:', margin, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(vacationData.fechaSalida || ''), margin + 78, yPos)
    
    yPos += 10
    doc.setFont('helvetica', 'bold')
    doc.text('Fecha de que debera presentarse a trabajar:', margin, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(vacationData.fechaRegreso || ''), margin + 105, yPos)
    
    yPos += 10
    doc.setFont('helvetica', 'bold')
    doc.text('Comentarios:', margin, yPos)
    
    yPos += 5
    doc.setLineWidth(0.3)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    
    yPos += 5
    doc.line(margin, yPos, pageWidth - margin, yPos)
    
    if (vacationData.comentarios) {
      yPos += 7
      doc.setFontSize(10)
      const comentariosLines = doc.splitTextToSize(String(vacationData.comentarios), pageWidth - (margin * 2))
      doc.text(comentariosLines, margin, yPos)
      yPos += (comentariosLines.length * 5)
    }
    
    yPos += 12
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Atentamente', pageWidth / 2, yPos, { align: 'center' })
    
    yPos += 20
    doc.setLineWidth(0.3)
    doc.line(margin + 20, yPos, pageWidth / 2 - 10, yPos)
    yPos += 5
    doc.setFontSize(9)
    doc.text('Nombre y firma Autorizada', pageWidth / 4 + 10, yPos, { align: 'center' })
    
    yPos -= 5
    doc.line(pageWidth / 2 + 10, yPos, pageWidth - margin - 20, yPos)
    yPos += 5
    doc.text('Firma del Trabajador', pageWidth * 3/4 - 10, yPos, { align: 'center' })
    
    yPos = pageHeight - 10
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text('C.C.P. Expediente', margin, yPos)
    
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    
    const timestamp = new Date().getTime()
    const safeName = (vacationData.nombre || 'empleado').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '_').replace(/\s+/g, '_')
    const fileName = `Formato_Vacaciones_${safeName}_${timestamp}.pdf`
    
    const downloadLink = document.createElement('a')
    downloadLink.href = pdfUrl
    downloadLink.download = fileName
    downloadLink.style.display = 'none'
    
    document.body.appendChild(downloadLink)
    downloadLink.click()
    
    setTimeout(() => {
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(pdfUrl)
    }, 100)
    
    return { success: true, fileName: fileName }
    
  } catch (error) {
    console.error('Error generando PDF:', error)
    return { success: false, error: error.message }
  }
}