-- Datos exclusivamente para verificacion visual en una base H2 temporal.
INSERT INTO dbo.categoria(nombre,activo) VALUES('Carnes',1),('Verduras',1),('Abarrotes',1),('Bebidas',1),('Insumos',1);
INSERT INTO dbo.unidad(codigo,nombre) VALUES('kg','Kilogramo'),('L','Litro'),('und','Unidad');
INSERT INTO dbo.producto(codigo,nombre,categoria_id,unidad_id,activo) VALUES
('PR-001','Pollo entero',1,1,1),('PR-002','Papa amarilla',2,1,1),('PR-003','Aceite vegetal',3,2,1),('PR-004','Carbon vegetal',5,1,1),('PR-005','Gaseosa 1.5 L',4,3,1),('PR-006','Aji amarillo',2,1,0);
INSERT INTO dbo.sede(codigo,nombre,activo) VALUES('SD-01','Lima Centro',1),('SD-02','San Miguel',1),('SD-03','Surco',1);
