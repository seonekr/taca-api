var express = require("express");
var cors = require("cors");
var app = express();
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
const bcrypt = require("bcrypt");
const saltRounds = 10;
var jwt = require("jsonwebtoken");
const secret = "Humascot-TACA2023";
require('dotenv').config()

app.use(cors());

const mysql = require("mysql2");
// create the connection database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// ==================== Admin Management =====================
app.post("/admin/register", jsonParser, (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    const sql =
      "INSERT INTO admins (email, tel, fname, lname, department, password) VALUES (?)";
    const values = [
      req.body.email,
      req.body.tel,
      req.body.fname,
      req.body.lname,
      req.body.department,
      hash,
    ];
    connection.query(sql, [values], (err, result) => {
      if (err) {
        res.json({ Status: "Error", Error: "Errer in running sql" });
        return;
      } else {
        res.json({ Status: "Success" });
      }
    });
  });
});

app.post("/admin", jsonParser, (req, res) => {
  const sql = "SELECT * FROM admins WHERE email = ?";
  connection.query(sql, [req.body.email], (err, result) => {
    if (err) {
      return res.json({ Status: "Error", Error: "Errer in running sql" });
    }
    if (result.length > 0) {
      bcrypt.compare(
        req.body.password.toString(),
        result[0].password,
        (err, response) => {
          if (err) return res.json({ Error: "Password error" });
          if (response) {
            const token = jwt.sign({id: result[0].id, email: result[0].email }, secret, {
              expiresIn: "1d",
            });
            return res.json({ Status: "Success", Token: token, id: result[0].id});
          } else {
            return res.json({
              Status: "Error",
              Error: "Wrong Password",
            });
          }
        }
      );
    } else {
      return res.json({ Status: "Error", Error: "Wrong Email or Password" });
    }
  });
});

app.post("/authen", jsonParser, (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    var decoded = jwt.verify(token, secret);
    res.json({ Status: "Success", decoded });
  } catch (err) {
    res.json({ Status: "Error", Error: err.message });
  }
});

app.get("/allAdmins", (req, res) => {
  const sql = "SELECT * FROM admins";
  connection.query(sql, (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Errer in running query" });
    return res.json({ Status: "Success", Result: result });
  });
});

app.get("/getAdmin/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM admins WHERE id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Errer in running query" });
    return res.json({ Status: "Success", Result: result });
  });
});

app.put("/updateAdmin/:id", jsonParser, (req, res) => {
  const id = req.params.id;

  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    const sql =
      "UPDATE admins SET `email` = ?, `tel` = ?, `fname` = ?, `lname` = ?, `department` = ?, `password` = ? WHERE id = ?";

    const values = [
      req.body.email,
      req.body.tel,
      req.body.fname,
      req.body.lname,
      req.body.department,
      hash,
    ];

    connection.query(sql, [...values, id], (err, data) => {
      if (err) res.json({ Status: "Error", Error: "Errer in running sql" });
      return res.json({ Status: "Success", data });
    });
  });
});

app.get("/deleteAdmin/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM admins WHERE id = ?";

  connection.query(sql, [id], (err, result) => {
    if (err)
      return res.json({
        Status: "Error",
        Error: "Errer in running sql",
      });
    return res.json({ Status: "Success" });
  });
});

app.get("/countAdmin", (req, res) => {
  const sql = "SELECT count(id) as admins FROM admins";

  connection.query(sql, (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Errer in running sql" });
    return res.json({ result });
  });
});

// ==================== Customer Management =====================

app.post("/register", jsonParser, (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    const sql =
      "INSERT INTO customers (email, tel, fname, lname, password) VALUES (?)";
    const values = [
      req.body.email,
      req.body.tel,
      req.body.fname,
      req.body.lname,
      hash,
    ];
    connection.query(sql, [values], (err, result) => {
      if (err) {
        return res.json({
          Status: "Error",
          Error: "Errer in running sql",
        });
      }
      return res.json({ Status: "Success" });
    });
  });
});

app.post("/login", jsonParser, (req, res) => {
  const sql = "SELECT * FROM customers WHERE email = ?";
  connection.query(sql, [req.body.email], (err, result) => {
    if (err) {
      return res.json({ Status: "Error", Error: "Errer in running sql" });
    }
    if (result.length > 0) {
      bcrypt.compare(
        req.body.password.toString(),
        result[0].password,
        (err, response) => {
          if (err) return res.json({ Error: "Password error" });
          if (response) {
            const token = jwt.sign({ email: result[0].email }, secret, {
              expiresIn: "1d",
            });
            return res.json({ Status: "Success", Token: token, id: result[0].id});
          } else {
            return res.json({
              Status: "Error",
              Error: "Wrong Password",
            });
          }
        }
      );
    } else {
      return res.json({ Status: "Error", Error: "Wrong Email or Password" });
    }
  });
});

app.get("/allCustomers", (req, res) => {
  const sql = "SELECT * FROM customers";
  connection.query(sql, (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Errer in running sql" });
    return res.json({ Status: "Success", Result: result });
  });
});

app.get("/getCustomer/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM customers WHERE id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Errer in running sql" });
    return res.json({ Status: "Success", Result: result });
  });
});

app.put("/updateCustomer/:id", jsonParser, (req, res) => {
  const id = req.params.id;

  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    const sql =
      "UPDATE customers SET `email` = ?, `tel` = ?, `fname` = ?, `lname` = ?, `password` = ? WHERE id = ?";

    const values = [
      req.body.email,
      req.body.tel,
      req.body.fname,
      req.body.lname,
      hash,
    ];

    connection.query(sql, [...values, id], (err, data) => {
      if (err) res.json({ Status: "Error", Error: "Errer in running sql" });
      return res.json({ Status: "Success", data });
    });
  });
});

app.get("/deleteCustomer/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM customers WHERE id = ?";

  connection.query(sql, [id], (err, result) => {
    if (err)
      return res.json({
        Status: "Error",
        Error: "Errer in running sql",
      });
    return res.json({ Status: "Success" });
  });
});

app.get("/countCustomer", (req, res) => {
  const sql = "SELECT count(id) as customers FROM customers";

  connection.query(sql, (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Errer in running sql" });
    return res.json({ result });
  });
});

// ==================== Category Management =====================

app.post("/addCategory", jsonParser, (req, res) => {
  const sql = "INSERT INTO categories (name) VALUES (?)";
  const values = [req.body.name];
  connection.query(sql, [values], (err, result) => {
    if (err) {
      return res.json({
        Status: "Error",
        Error: "Errer in running sql",
      });
    }
    return res.json({ Status: "Success" });
  });
});

app.get("/allCategories", (req, res) => {
  const sql = "SELECT * FROM categories";
  connection.query(sql, (err, result) => {
    if (err)
      return res.json({
        Status: "Error",
        Error: "Errer in running sql",
      });
    return res.json({ Status: "Success", Result: result });
  });
});

app.get("/getCategory/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM categories WHERE id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err)
      return res.json({
        Status: "Error",
        Error: "Errer in running sql",
      });
    return res.json({ Status: "Success", Result: result });
  });
});

app.put("/updateCategory/:id", jsonParser, (req, res) => {
  const id = req.params.id;

  const sql = "UPDATE categories SET `name` = ? WHERE id = ?";

  const values = [req.body.name];

  connection.query(sql, [...values, id], (err, data) => {
    if (err) res.json({ Status: "Error", Error: "Errer in running sql" });
    return res.json({ Status: "Success", data });
  });
});

app.get("/deleteCategory/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM categories WHERE id = ?";

  connection.query(sql, [id], (err, result) => {
    if (err)
      return res.json({
        Status: "Error",
        Error: "Errer in running sql",
      });
    return res.json({ Status: "Success" });
  });
});

app.get("/countCategory", (req, res) => {
  const sql = "SELECT count(id) as category FROM categories";

  connection.query(sql, (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Errer in running sql" });
    return res.json({ result });
  });
});

// ==================== Product Management =====================

app.post("/addProduct", jsonParser, (req, res) => {
  const sql =
    "INSERT INTO products (cat_id, name, price, size, color, descriptions, image) VALUES (?)";
  const values = [
    req.body.cat_id,
    req.body.name,
    req.body.price,
    req.body.size,
    req.body.color,
    req.body.descriptions,
    req.body.image,
  ];
  connection.query(sql, [values], (err, result) => {
    if (err) {
      return res.json({
        Status: "Error",
        Error: "Errer in running sql",
      });
    }
    return res.json({ Status: "Success" });
  });
});

app.get("/allProducts", (req, res) => {
  const sql = "SELECT * FROM products";
  connection.query(sql, (err, result) => {
    if (err)
      return res.json({
        Status: "Error",
        Error: "Errer in running sql",
      });
    return res.json({ Status: "Success", Result: result });
  });
});

app.get("/getProduct/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM products WHERE id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err)
      return res.json({
        Status: "Error",
        Error: "Errer in running sql",
      });
    return res.json({ Status: "Success", Result: result });
  });
});

app.put("/updateProduct/:id", jsonParser, (req, res) => {
  const id = req.params.id;

  const sql =
    "UPDATE products SET `cat_id` = ?, `name` = ?, `price` = ?, `size` = ?, `color` = ?, `descriptions` = ?, `image` = ? WHERE id = ?";

  const values = [
    req.body.cat_id,
    req.body.name,
    req.body.price,
    req.body.size,
    req.body.color,
    req.body.descriptions,
    req.body.image,
  ];

  connection.query(sql, [...values, id], (err, data) => {
    if (err) res.json({ Status: "Error", Error: "Errer in running sql" });
    return res.json({ Status: "Success", data });
  });
});

app.get("/deleteProduct/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM products WHERE id = ?";

  connection.query(sql, [id], (err, result) => {
    if (err)
      return res.json({
        Status: "Error",
        Error: "Errer in running sql",
      });
    return res.json({ Status: "Success" });
  });
});

app.get("/countProduct", (req, res) => {
  const sql = "SELECT count(id) as products FROM products";

  connection.query(sql, (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Errer in running sql" });
    return res.json({ result });
  });
});

// ==================== Cart Management =====================
app.post("/addToCart", jsonParser, (req, res) => {
  const sql =
    "INSERT INTO carts (product_id, customer_id, size, color, quantity) VALUES (?)";
  const values = [
    req.body.product_id,
    req.body.customer_id,
    req.body.size,
    req.body.color,
    req.body.quantity,
  ];
  connection.query(sql, [values], (err, result) => {
    if (err) {
      return res.json({
        Status: "Error",
        Error: "Errer in running sql",
      });
    }
    return res.json({ Status: "Success" });
  });
});

app.get("/getProductsInCart/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM carts WHERE customer_id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err)
      return res.json({
        Status: "Error",
        Error: "Errer in running sql",
      });
    return res.json({ Status: "Success", Result: result });
  });
});

app.get("/deleteProductInCart/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM carts WHERE id = ?";

  connection.query(sql, [id], (err, result) => {
    if (err)
      return res.json({
        Status: "Error",
        Error: "Errer in running sql",
      });
    return res.json({ Status: "Success" });
  });
});

app.get("/countProduct", (req, res) => {
  const sql = "SELECT count(id) as products FROM products";

  connection.query(sql, (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Errer in running sql" });
    return res.json({ result });
  });
});


app.listen(5000, () => {
  console.log("Web server listening on port 5000");
});
