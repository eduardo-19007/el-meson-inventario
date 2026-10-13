package pe.elmeson.inventario.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.elmeson.inventario.domain.Producto;

public interface ProductoRepository
                extends JpaRepository<Producto, Long> {

        List<Producto> findAllByOrderByNombreAsc();

        boolean existsByCodigoIgnoreCase(String codigo);

        boolean existsByCodigoIgnoreCaseAndIdNot(
                        String codigo,
                        Long id);
}