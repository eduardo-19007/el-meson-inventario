CREATE SCHEMA IF NOT EXISTS dbo;
CREATE TABLE dbo.categoria (
        id INT IDENTITY(1,1) NOT NULL,
        nombre NVARCHAR(80) NOT NULL,
        activo BIT NOT NULL
            DEFAULT 1,

        CONSTRAINT PK_categoria PRIMARY KEY (id),
        CONSTRAINT UQ_categoria_nombre UNIQUE (nombre)
    );
CREATE TABLE dbo.unidad (
        id INT IDENTITY(1,1) NOT NULL,
        codigo NVARCHAR(10) NOT NULL,
        nombre NVARCHAR(40) NOT NULL,

        CONSTRAINT PK_unidad PRIMARY KEY (id),
        CONSTRAINT UQ_unidad_codigo UNIQUE (codigo)
    );
CREATE TABLE dbo.producto (
        id BIGINT IDENTITY(1,1) NOT NULL,
        codigo NVARCHAR(30) NOT NULL,
        nombre NVARCHAR(120) NOT NULL,
        categoria_id INT NOT NULL,
        unidad_id INT NOT NULL,
        activo BIT NOT NULL
            DEFAULT 1,

        CONSTRAINT PK_producto PRIMARY KEY (id),
        CONSTRAINT UQ_producto_codigo UNIQUE (codigo),

        CONSTRAINT FK_producto_categoria
            FOREIGN KEY (categoria_id)
            REFERENCES dbo.categoria(id),

        CONSTRAINT FK_producto_unidad
            FOREIGN KEY (unidad_id)
            REFERENCES dbo.unidad(id)
    );
CREATE TABLE dbo.control_operacion(id INT NOT NULL PRIMARY KEY, version BIGINT NOT NULL DEFAULT 0);
CREATE TABLE dbo.sede(
 id INT IDENTITY PRIMARY KEY, codigo NVARCHAR(20) NOT NULL UNIQUE,
 nombre NVARCHAR(100) NOT NULL, direccion NVARCHAR(250), activo BIT NOT NULL DEFAULT 1
);
CREATE TABLE dbo.usuario(
 id BIGINT IDENTITY PRIMARY KEY, usuario NVARCHAR(50) NOT NULL UNIQUE,
 nombre NVARCHAR(150) NOT NULL, password_hash NVARCHAR(255) NOT NULL,
 rol NVARCHAR(20) NOT NULL CHECK(rol IN ('ADMIN','ENCARGADO','CONSULTOR')),
 activo BIT NOT NULL DEFAULT 1
);
CREATE TABLE dbo.usuario_sede(
 usuario_id BIGINT NOT NULL REFERENCES dbo.usuario(id),
 sede_id INT NOT NULL REFERENCES dbo.sede(id),
 PRIMARY KEY(usuario_id,sede_id)
);
CREATE TABLE dbo.existencia(
 sede_id INT NOT NULL REFERENCES dbo.sede(id),
 producto_id BIGINT NOT NULL REFERENCES dbo.producto(id),
 cantidad DECIMAL(18,3) NOT NULL DEFAULT 0 CHECK(cantidad>=0),
 stock_minimo DECIMAL(18,3) NOT NULL DEFAULT 0 CHECK(stock_minimo>=0),
 PRIMARY KEY(sede_id,producto_id)
);
CREATE TABLE dbo.transferencia(
 id BIGINT IDENTITY PRIMARY KEY,
 origen_id INT NOT NULL REFERENCES dbo.sede(id), destino_id INT NOT NULL REFERENCES dbo.sede(id),
 creador_id BIGINT NOT NULL REFERENCES dbo.usuario(id),
 despachador_id BIGINT REFERENCES dbo.usuario(id), receptor_id BIGINT REFERENCES dbo.usuario(id),
 estado NVARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
 creada_en DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP, despachada_en DATETIME2, recibida_en DATETIME2,
 incidencia NVARCHAR(300), idempotencia NVARCHAR(36) NOT NULL UNIQUE,
 CHECK(origen_id<>destino_id),
 CHECK(estado IN ('BORRADOR','DESPACHADA','RECIBIDA','CANCELADA','DEVUELTA'))
);
CREATE TABLE dbo.detalle_transferencia(
 id BIGINT IDENTITY PRIMARY KEY, transferencia_id BIGINT NOT NULL REFERENCES dbo.transferencia(id),
 producto_id BIGINT NOT NULL REFERENCES dbo.producto(id), cantidad DECIMAL(18,3) NOT NULL CHECK(cantidad>0),
 UNIQUE(transferencia_id,producto_id)
);
CREATE TABLE dbo.movimiento(
 id BIGINT IDENTITY PRIMARY KEY, sede_id INT NOT NULL REFERENCES dbo.sede(id),
 usuario_id BIGINT NOT NULL REFERENCES dbo.usuario(id),
 tipo NVARCHAR(30) NOT NULL, fecha_registro DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
 motivo NVARCHAR(300) NOT NULL, referencia NVARCHAR(100), proveedor NVARCHAR(150),
 reverso_de_id BIGINT REFERENCES dbo.movimiento(id),
 transferencia_id BIGINT REFERENCES dbo.transferencia(id), idempotencia NVARCHAR(36) NOT NULL UNIQUE,
 CHECK(tipo IN ('INICIAL','ENTRADA','SALIDA','MERMA','AJUSTE_ENTRADA','AJUSTE_SALIDA',
 'REVERSO_ENTRADA','REVERSO_SALIDA','TRANSFERENCIA_ENTRADA','TRANSFERENCIA_SALIDA'))
);
CREATE TABLE dbo.detalle_movimiento(
 id BIGINT IDENTITY PRIMARY KEY, movimiento_id BIGINT NOT NULL REFERENCES dbo.movimiento(id),
 producto_id BIGINT NOT NULL REFERENCES dbo.producto(id), cantidad DECIMAL(18,3) NOT NULL CHECK(cantidad>0),
 costo_unitario DECIMAL(18,4) CHECK(costo_unitario>=0),
 UNIQUE(movimiento_id,producto_id)
);
CREATE TABLE dbo.auditoria(
 id BIGINT IDENTITY PRIMARY KEY, usuario_id BIGINT REFERENCES dbo.usuario(id),
 fecha DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP, accion NVARCHAR(50) NOT NULL,
 entidad NVARCHAR(50) NOT NULL, entidad_id BIGINT, resultado NVARCHAR(20) NOT NULL,
 descripcion NVARCHAR(300)
);
INSERT INTO dbo.control_operacion(id,version) VALUES(1,0);
