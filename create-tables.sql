CREATE TABLE IF NOT EXISTS web_analyses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  keywords TEXT,
  canonical_url TEXT,
  robots_meta TEXT,
  viewport_meta TEXT,
  open_graph_tags JSON,
  twitter_card_tags JSON,
  schema_markup BOOLEAN DEFAULT FALSE,
  sitemap BOOLEAN DEFAULT FALSE,
  core_web_vitals JSON,
  performance_score INT DEFAULT 0,
  accessibility_score INT DEFAULT 0,
  best_practices_score INT DEFAULT 0,
  seo_score INT DEFAULT 0,
  mobile_screenshot MEDIUMTEXT,
  desktop_screenshot MEDIUMTEXT,
  recommendations JSON,
  diagnostics JSON,
  insights JSON,
  technical_checks JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shared_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  share_token VARCHAR(191) NOT NULL UNIQUE,
  url TEXT NOT NULL,
  analysis_data LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_share_token (share_token),
  INDEX idx_expires_at (expires_at)
);