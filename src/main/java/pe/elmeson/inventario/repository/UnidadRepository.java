package pe.elmeson.inventario.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.elmeson.inventario.domain.Unidad;

public interface UnidadRepository
        extends JpaRepository<Unidad, Integer> {

    List<Unidad> findAllByOrderByNombreAsc();
}