package pe.elmeson.inventario.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.elmeson.inventario.domain.Categoria;

public interface CategoriaRepository
        extends JpaRepository<Categoria, Integer> {

    List<Categoria> findByActivoTrueOrderByNombreAsc();
}