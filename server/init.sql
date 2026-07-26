-- Initialize Database Schema for Release Checklist Tool

CREATE DATABASE IF NOT EXISTS release_check;
USE release_check;

CREATE TABLE IF NOT EXISTS releases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  due_date DATETIME NOT NULL,
  additional_info TEXT,
  completed_steps JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default initial release records
INSERT INTO releases (name, due_date, additional_info, completed_steps) VALUES
('Version 1.0.1', '2022-09-20 00:00:00', 'Initial production release patch with critical bugfixes.', '["step-1", "step-2", "step-3", "step-4", "step-5", "step-6", "step-7"]'),
('Version 1.0.2', '2022-09-28 00:00:00', 'Maintenance update and security patches.', '["step-1", "step-2", "step-3", "step-4", "step-5", "step-6", "step-7"]'),
('Version 1.1.0', '2022-10-10 00:00:00', 'New dashboard features and improved reporting UI.', '["step-1", "step-2", "step-3", "step-4"]'),
('Version 2 (beta)', '2022-11-01 00:00:00', 'Major framework upgrade and API refactoring.', '[]');
