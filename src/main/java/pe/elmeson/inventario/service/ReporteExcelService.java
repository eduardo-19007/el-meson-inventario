package pe.elmeson.inventario.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.google.common.collect.ImmutableList;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

@Service
public class ReporteExcelService {
    private static final List<String> CABECERAS = ImmutableList.of(
            "Sede", "Codigo", "Producto", "Unidad", "Cantidad", "Stock minimo", "Situacion");

    private final InventarioService inventario;

    public ReporteExcelService(InventarioService inventario) {
        this.inventario = inventario;
    }

    public byte[] existencias() {
        List<Map<String, Object>> datos = inventario.stock(null);
        try (Workbook libro = new XSSFWorkbook(); ByteArrayOutputStream salida = new ByteArrayOutputStream()) {
            Sheet hoja = libro.createSheet("Existencias");
            CellStyle encabezado = libro.createCellStyle();
            encabezado.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
            encabezado.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row filaCabecera = hoja.createRow(0);
            for (int i = 0; i < CABECERAS.size(); i++) {
                filaCabecera.createCell(i).setCellValue(CABECERAS.get(i));
                filaCabecera.getCell(i).setCellStyle(encabezado);
            }

            int numeroFila = 1;
            for (Map<String, Object> dato : datos) {
                Row fila = hoja.createRow(numeroFila++);
                fila.createCell(0).setCellValue(texto(dato.get("sede")));
                fila.createCell(1).setCellValue(texto(dato.get("codigo")));
                fila.createCell(2).setCellValue(texto(dato.get("producto")));
                fila.createCell(3).setCellValue(texto(dato.get("unidad")));
                fila.createCell(4).setCellValue(numero(dato.get("cantidad")));
                fila.createCell(5).setCellValue(numero(dato.get("stock_minimo")));
                fila.createCell(6).setCellValue(numero(dato.get("alerta")) == 1 ? "REPOSICION" : "NORMAL");
            }
            for (int i = 0; i < CABECERAS.size(); i++) hoja.autoSizeColumn(i);
            libro.write(salida);
            return salida.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo generar el reporte Excel", e);
        }
    }

    private String texto(Object valor) {
        return StringUtils.defaultString(valor == null ? null : valor.toString()).trim();
    }

    private double numero(Object valor) {
        return valor instanceof Number n ? n.doubleValue() : 0;
    }
}
