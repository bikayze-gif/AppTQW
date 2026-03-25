-- Migración: Crear tabla tb_timeline_tasks
-- Descripción: Sistema de tareas para la línea de tiempo con archivos adjuntos
-- Fecha: 2025-03-25

CREATE TABLE IF NOT EXISTS `tb_timeline_tasks` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `file_path` VARCHAR(500) NULL,
  `file_name` VARCHAR(255) NULL,
  `file_type` VARCHAR(50) NULL,
  `file_size` INT NULL,
  `category` VARCHAR(20) NOT NULL DEFAULT 'reminder' COMMENT 'meeting, deadline, reminder, personal',
  `status` VARCHAR(20) NOT NULL DEFAULT 'upcoming' COMMENT 'completed, upcoming, cancelled',
  `task_date` DATE NOT NULL,
  `task_time` VARCHAR(10) NOT NULL COMMENT 'HH:MM format',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_user_date` (`user_id`, `task_date`),
  INDEX `idx_created` (`created_at`),

  CONSTRAINT `fk_timeline_user` FOREIGN KEY (`user_id`) REFERENCES `tb_user_tqw` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentarios de la tabla
ALTER TABLE `tb_timeline_tasks` COMMENT = 'Tareas de línea de tiempo con archivos adjuntos para Flujo Logístico';
