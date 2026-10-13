package pe.elmeson.inventario.dto;

public record ProductoResponse(
        Long id,
        String codigo,
        String nombre,
        Integer categoriaId,
        String categoria,
        Integer unidadId,
        String unidad,
        boolean activo
) {
}