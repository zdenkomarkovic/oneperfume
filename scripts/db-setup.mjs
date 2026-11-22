// Kreira tabele u MariaDB, uvozi proizvode iz lib/products-data.json (samo ako je baza prazna)
// i pravi prvog admina iz ADMIN_EMAIL / ADMIN_PASSWORD.
//
// Pokretanje:  npm run db:setup
import fs from "node:fs";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const env = process.env;
const conn = await mysql.createConnection({
  host: env.DB_HOST ?? "127.0.0.1",
  port: Number(env.DB_PORT ?? 3306),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  multipleStatements: true,
});

await conn.query(`
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  price INT NOT NULL,
  volume VARCHAR(50) NOT NULL DEFAULT '',
  gender ENUM('muski','zenski','unisex') NOT NULL DEFAULT 'unisex',
  description LONGTEXT NULL,
  notes LONGTEXT NULL,
  images LONGTEXT NULL,
  rating DECIMAL(2,1) NULL,
  is_set TINYINT(1) NOT NULL DEFAULT 0,
  sold_out TINYINT(1) NOT NULL DEFAULT 0,
  best_seller TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (brand),
  INDEX (sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_categories (
  product_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (product_id, category_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  label VARCHAR(50) NOT NULL,
  price INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status ENUM('novo','potvrdjeno','poslato','isporuceno','otkazano') NOT NULL DEFAULT 'novo',
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(150) NOT NULL,
  address VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  zip VARCHAR(10) NOT NULL,
  note TEXT NULL,
  admin_note TEXT NULL,
  total INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (status),
  INDEX (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  title VARCHAR(400) NOT NULL,
  variant VARCHAR(50) NULL,
  qty INT NOT NULL,
  unit_price INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
`);
console.log("✓ tabele spremne");

// ── Uvoz proizvoda (samo kad je baza prazna) ────────────────────────────────
const [[{ n }]] = await conn.query("SELECT COUNT(*) n FROM products");
if (n === 0) {
  const data = JSON.parse(fs.readFileSync("lib/products-data.json", "utf8"));
  const labels = {
    muski: "Muški parfemi",
    zenski: "Ženski parfemi",
    unisex: "Unisex",
    "zenski-setovi": "Ženski setovi",
    "muski-setovi": "Muški setovi",
  };
  const order = ["muski", "zenski", "unisex", "zenski-setovi", "muski-setovi"];
  const slugs = [...new Set(data.flatMap((p) => p.categories))].sort(
    (a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99),
  );
  const catId = {};
  for (const [i, slug] of slugs.entries()) {
    const [r] = await conn.query("INSERT INTO categories (slug, name, sort_order) VALUES (?,?,?)", [slug, labels[slug] ?? slug, i]);
    catId[slug] = r.insertId;
  }

  for (const [i, p] of data.entries()) {
    const [r] = await conn.query(
      `INSERT INTO products (slug,name,brand,price,volume,gender,description,notes,images,rating,is_set,sold_out,best_seller,sort_order)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        p.slug, p.name, p.brand, p.price, p.volume ?? "", p.gender,
        p.description ? JSON.stringify(p.description) : null,
        p.notes ? JSON.stringify(p.notes) : null,
        JSON.stringify(p.images ?? []),
        p.rating ?? null, p.set ? 1 : 0, p.soldOut ? 1 : 0, i < 8 ? 1 : 0, i,
      ],
    );
    for (const c of p.categories) await conn.query("INSERT IGNORE INTO product_categories VALUES (?,?)", [r.insertId, catId[c]]);
    for (const [k, v] of (p.variants ?? []).entries())
      await conn.query("INSERT INTO product_variants (product_id,label,price,sort_order) VALUES (?,?,?,?)", [r.insertId, v.label, v.price, k]);
  }
  console.log(`✓ uvezeno ${data.length} proizvoda i ${slugs.length} kategorija`);
} else {
  console.log(`• proizvodi već postoje (${n}), uvoz preskočen`);
}

// Poruke: soft-delete (folder "Obrisano")
await conn.query("ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL");

// Šifra proizvoda (opciono)
await conn.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(60) NULL AFTER slug");

// Plaćanje i dostava kurirskom službom
await conn.query(`ALTER TABLE orders MODIFY COLUMN status
  ENUM('ceka_placanje','novo','potvrdjeno','poslato','isporuceno','otkazano') NOT NULL DEFAULT 'novo'`);
await conn.query(`ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method ENUM('pouzece','kartica') NOT NULL DEFAULT 'pouzece',
  ADD COLUMN IF NOT EXISTS payment_status ENUM('cekanje','placeno','neuspelo','vraceno') NOT NULL DEFAULT 'cekanje',
  ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS public_token CHAR(32) NULL,
  ADD COLUMN IF NOT EXISTS courier VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100) NULL`);
await conn.query("UPDATE orders SET public_token = REPLACE(UUID(), '-', '') WHERE public_token IS NULL");
try {
  await conn.query("ALTER TABLE orders ADD UNIQUE INDEX uq_orders_token (public_token)");
} catch (e) {
  if (e.code !== "ER_DUP_KEYNAME") throw e;
}

// Porudžbine se ne smeju brisati – ni iz aplikacije, ni ručnim SQL-om (otkazuju se statusom "otkazano").
await conn.query("DROP TRIGGER IF EXISTS orders_no_delete");
await conn.query(`CREATE TRIGGER orders_no_delete BEFORE DELETE ON orders FOR EACH ROW
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Porudzbine se ne brisu. Promeni status u otkazano.'`);

// Brendovi: dopuni tabelu brendovima koji već postoje na proizvodima
await conn.query("INSERT IGNORE INTO brands (name) SELECT DISTINCT brand FROM products");

// ── Admin ───────────────────────────────────────────────────────────────────
const [[{ a }]] = await conn.query("SELECT COUNT(*) a FROM admins");
if (a === 0) {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.log("! ADMIN_EMAIL / ADMIN_PASSWORD nisu postavljeni – admin nije napravljen");
  } else {
    await conn.query("INSERT INTO admins (email, password_hash) VALUES (?,?)", [
      env.ADMIN_EMAIL.toLowerCase(),
      await bcrypt.hash(env.ADMIN_PASSWORD, 11),
    ]);
    console.log(`✓ admin napravljen: ${env.ADMIN_EMAIL}`);
  }
} else {
  console.log("• admin već postoji");
}

await conn.end();
