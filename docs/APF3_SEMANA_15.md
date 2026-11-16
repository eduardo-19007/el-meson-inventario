# Avance de Proyecto Final 3 - semana 15

## Estado de implementación

El sistema de inventario multisede de El Mesón se encuentra implementado como una aplicación web con backend Java y frontend Angular. La solución utiliza Spring Boot, Spring Security, Spring Data JPA, JDBC transaccional, SQL Server y Angular. El repositorio se gestiona con Git y GitHub.

Módulos disponibles:

- autenticación y control de acceso por roles;
- administración de usuarios y sedes;
- catálogo de productos, categorías y unidades;
- entradas, salidas y mermas;
- ajustes por conteo físico y reversos enlazados;
- transferencias entre sedes con despacho, recepción e incidencias;
- existencias, mínimos y kardex;
- reportes CSV y Excel;
- bitácora de auditoría.

## Arquitectura aplicada

La solución sigue una arquitectura modular por capas. Los controladores exponen la API HTTP y validan los DTO. Los servicios concentran permisos, reglas de negocio y transacciones. Los repositorios JPA y `JdbcTemplate` implementan el acceso a datos. Angular consume la API mediante servicios y presenta componentes separados por módulo.

Esta distribución evidencia MVC y Service Layer. Los repositorios representan la capa DAO. Los DTO impiden exponer entidades y hashes de contraseña. La inversión de dependencias se aplica mediante inyección de constructor. Las responsabilidades se separan entre seguridad, catálogo, inventario, transferencias y reportes.

## Seguridad

- contraseñas almacenadas con BCrypt;
- sesión HTTP y protección CSRF;
- autorización por rol y sede en el servidor;
- consultas parametrizadas;
- secretos fuera del repositorio;
- movimientos históricos inmutables;
- claves de idempotencia para evitar duplicados;
- transacciones para confirmar cabecera, detalle y saldo como una unidad.

## Librerías Java

| Librería | Uso en el proyecto |
|---|---|
| Apache POI | Generación del reporte de existencias en formato XLSX. |
| Apache Commons Lang | Normalización segura de textos incluidos en el reporte. |
| Google Guava | Lista inmutable de columnas del reporte. |
| Logback | Registro de eventos de ejecución mediante Spring Boot. |

## Pruebas

El backend contiene pruebas unitarias y de integración con H2 aislado de SQL Server. Las pruebas comprueban autenticación, CSRF, roles, restricciones por sede, transacciones, concurrencia, idempotencia, reversos y transferencias. El frontend contiene pruebas de arranque y navegación y se valida mediante compilación de producción.

La evidencia final debe incluir la salida de `mvnw.cmd test`, `npm test -- --watch=false`, capturas de los módulos y resultados de operaciones realizadas en SQL Server.

## Correspondencia con la rúbrica APF3

| Criterio | Evidencia |
|---|---|
| Diseño de la solución | MVC, DAO, DTO, Service Layer, SOLID, seguridad y transacciones. |
| Recursos Java | Apache POI, Apache Commons, Guava y Logback con usos funcionales. |
| Control de versiones | Historial completo en GitHub y ramas con nombres funcionales. |
| Interfaces gráficas | Angular con pantallas de todos los módulos comprometidos. |
| Producto final | Flujo integrado con SQL Server, roles, inventario, transferencias y reportes. |
| Sustentación | Demostración de arquitectura, librerías, GitHub, pruebas y flujo completo. |

## Evidencias pendientes para el informe

1. Capturas del acceso y los tres roles.
2. Capturas de usuarios, sedes y productos.
3. Registro de entrada, salida y merma.
4. Transferencia completa entre dos sedes.
5. Ajuste, mínimo y kardex.
6. Reportes CSV y Excel.
7. Bitácora de auditoría.
8. Historial de commits y repositorio GitHub.
9. Resultado de las pruebas automatizadas.
10. Diagramas actualizados de arquitectura, entidad relación, casos de uso y BPMN.
