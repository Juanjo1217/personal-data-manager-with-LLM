DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    fecha_registro DATE NOT NULL,
    ultimo_login DATE,
    telefono VARCHAR(15),
    direccion VARCHAR(255)
);

-- Agregar datos de prueba a la tabla usuarios
INSERT INTO usuarios (nombre, email, fecha_registro, ultimo_login, telefono, direccion) VALUES
('Juan Pérez', 'juan.perez@example.com', '2025-01-01', '2025-05-20', '555-1234', 'Calle Falsa 123'),
('María López', 'maria.lopez@example.com', '2025-01-02', '2025-05-22', '555-5678', 'Avenida Siempreviva 456'),
('Carlos García', 'carlos.garcia@example.com', '2025-01-03', '2025-05-23', '555-9101', 'Boulevard Principal 789'),
('Ana Torres', 'ana.torres@example.com', '2025-01-04', '2025-05-21', '555-1122', 'Plaza Central 101'),
('Luis Martínez', 'luis.martinez@example.com', '2025-01-15', '2025-05-20', '555-1234', 'Calle Falsa 123'),
('Sofía Hernández', 'sofia.hernandez@example.com', '2025-02-10', '2025-05-22', '555-5678', 'Avenida Siempreviva 456'),
('Diego Fernández', 'diego.fernandez@example.com', '2025-03-05', '2025-05-23', '555-9101', 'Boulevard Principal 789'),
('Camila Gómez', 'camila.gomez@example.com', '2025-04-01', '2025-05-21', '555-1122', 'Plaza Central 101'),
('Mateo Ruiz', 'mateo.ruiz@example.com', '2025-01-20', '2025-05-19', '555-3344', 'Calle Secundaria 202'),
('Valentina Torres', 'valentina.torres@example.com', '2025-02-25', '2025-05-18', '555-5566', 'Avenida del Sol 303'),
('Lucas Ramírez', 'lucas.ramirez@example.com', '2025-03-15', '2025-05-17', '555-7788', 'Calle Luna 404'),
('Isabella Díaz', 'isabella.diaz@example.com', '2025-04-10', '2025-05-16', '555-9900', 'Avenida Estrella 505'),
('Emilio Castro', 'emilio.castro@example.com', '2025-01-30', '2025-05-15', '555-2233', 'Boulevard Norte 606'),
('Martina Vega', 'martina.vega@example.com', '2025-02-15', '2025-05-14', '555-4455', 'Plaza Sur 707');