INSERT INTO categories (name)
VALUES
    ('Hujjatlar'),
    ('Telefon'),
    ('Hamyon'),
    ('Kalitlar'),
    ('Sumka'),
    ('Boshqa')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (
    full_name,
    email,
    phone,
    password,
    role,
    is_verified
)
VALUES (
    'Super Admin',
    'admin@topildi.uz',
    '+998901234567',
    '$2b$10$CWXbWS/dCXk2ORNilNXHleWjKEPWV3io4aK1/szQiRumVOvhZVn9K',
    'admin',
    true
)
ON CONFLICT (email) DO NOTHING;