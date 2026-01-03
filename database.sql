-- Database Schema for Panel (formerly swap.lol)
-- Compatible with MySQL / MariaDB

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    google_id VARCHAR(255) NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_premium TINYINT(1) DEFAULT 0,
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    user_id INT PRIMARY KEY,
    slug VARCHAR(50) UNIQUE,
    username VARCHAR(50), -- Display name
    bio TEXT,
    avatar TEXT, -- URL or Base64
    background TEXT, -- URL or Base64
    accent_color VARCHAR(7) DEFAULT '#FFFFFF',
    opacity INT DEFAULT 60,
    blur INT DEFAULT 12,
    bg_effect VARCHAR(20) DEFAULT 'none',
    username_effect VARCHAR(20) DEFAULT 'none',
    discord_id VARCHAR(20),
    audio TEXT, -- URL
    custom_cursor TEXT, -- URL
    views INT DEFAULT 0,
    link_clicks INT DEFAULT 0,
    views_history JSON, -- Storing array of numbers as JSON
    -- Premium fields
    font_family VARCHAR(50),
    card_tilt TINYINT(1) DEFAULT 0,
    card_glow_color VARCHAR(7),
    badge_text VARCHAR(20),
    -- New decoration fields
    layout VARCHAR(20) DEFAULT 'center',
    transition VARCHAR(20) DEFAULT 'fade',
    link_style VARCHAR(20) DEFAULT 'minimal',
    link_layout VARCHAR(20) DEFAULT 'vertical',
    avatar_shape VARCHAR(20) DEFAULT 'circle',
    avatar_border VARCHAR(20) DEFAULT 'none',
    avatar_border_color VARCHAR(7) DEFAULT '#ffffff',
    avatar_size VARCHAR(20) DEFAULT 'medium',
    avatar_pulse TINYINT(1) DEFAULT 0,
    bio_effect VARCHAR(20) DEFAULT 'none',
    username_shadow VARCHAR(20) DEFAULT 'none',
    card_bg VARCHAR(20) DEFAULT 'blur',
    particles TINYINT(1) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Links Table (One-to-Many with Profiles)
CREATE TABLE IF NOT EXISTS links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100),
    url TEXT,
    icon TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Badges Table (One-to-Many with Profiles)
CREATE TABLE IF NOT EXISTS badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50),
    icon TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Templates Table
CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    name VARCHAR(100),
    data JSON, -- Storing the entire template configuration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Profile Views Tracking (prevent view farming)
CREATE TABLE IF NOT EXISTS profile_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_user_id INT NOT NULL,
    viewer_ip VARCHAR(45) NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_view (profile_user_id, viewer_ip),
    FOREIGN KEY (profile_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Daily Stats Table
CREATE TABLE IF NOT EXISTS daily_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    stat_date DATE NOT NULL,
    views INT DEFAULT 0,
    clicks INT DEFAULT 0,
    UNIQUE KEY unique_user_date (user_id, stat_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Files Table
CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    original_name VARCHAR(255),
    stored_name VARCHAR(255),
    size BIGINT,
    url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_slug ON profiles(slug);
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_google_id ON users(google_id);
