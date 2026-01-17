CREATE TABLE IF NOT EXISTS url_mappings (
    id SERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    alias VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS malicious_domains (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO malicious_domains (domain) VALUES 
('malicious-site.com'),
('phishing-example.org'),
('evil-attacker.net'),
('scam-link.biz'),
('fake-login.com')
ON CONFLICT (domain) DO NOTHING;