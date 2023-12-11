var express = require("express");
var cors = require("cors");
var app = express();
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
const multer = require("multer");
const bcrypt = require("bcrypt");
const path = require("path");
const saltRounds = 10;
var jwt = require("jsonwebtoken");
const secret = "Humascot-TACA2023";
require("dotenv").config();

app.use(cors());

const mysql = require("mysql2");
// create the connection database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// Middleware to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/images");
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
});

// Middleware to serve uploaded files statically
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "/uploads/images"))
);

// Middleware to parse JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== Authentication and Authenticate user =====================
app.post("/login", jsonParser, (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const sql = "SELECT * FROM register WHERE email = ?";
  connection.query(sql, [email], (err, result) => {
    if (err) {
      return res.json({ Status: "Error", Error: "Errer in running sql" });
    }
    if (result.length > 0) {
      bcrypt.compare(
        password.toString(),
        result[0].password,
        (err, response) => {
          if (err) return res.json({ Error: "Password error" });
          if (response) {
            if (result[0].urole === "Admin") {
              const token = jwt.sign(
                { email: result[0].email, urole: "Admin" },
                secret,
                {
                  expiresIn: "1d",
                }
              );
              return res.json({
                Status: "Success",
                urole: "Admin",
                userID: result[0].id,
                token: token,
              });
            } else {
              const token = jwt.sign(
                { email: result[0].email, urole: "Customer" },
                secret,
                {
                  expiresIn: "1d",
                }
              );
              return res.json({
                Status: "Success",
                urole: "Customer",
                userID: result[0].id,
                token: token,
              });
            }
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

// ==================== Customer Management =====================
app.post("/register", jsonParser, (req, res) => {
  const email = req.body.email;
  const urole = "Customer";
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  var reg_id = "";
  const fname = req.body.fname;
  const lname = req.body.lname;
  const tel = req.body.tel;
  const profile_image = "profile.png";

  if (
    fname !== "" &&
    lname !== "" &&
    email !== "" &&
    tel !== "" &&
    password !== "" &&
    confirmPassword !== ""
  ) {
    if (password === confirmPassword) {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        const sql1 =
          "INSERT INTO register (email, tel, urole, password) VALUES (?)";
        const values1 = [email, tel, urole, hash];

        connection.query(sql1, [values1], (err, result) => {
          if (err) {
            res.json({
              Status: "Error",
              Error: err.sqlMessage,
            });
            return;
          } else {
            // For select last user id
            const sql = "SELECT * FROM register ORDER BY id DESC LIMIT 1";
            connection.query(sql, (err, result) => {
              if (err)
                return res.json({
                  Status: "Error",
                  Error: err.sqlMessage,
                });
              reg_id = result[0].id;

              // For add Customer
              const sql2 =
                "INSERT INTO customers (reg_id, email, fname, lname, tel, profile_image) VALUES (?)";
              const values2 = [reg_id, email, fname, lname, tel, profile_image];
              connection.query(sql2, [values2], (err, result) => {
                if (err) {
                  res.json({
                    Status: "Error",
                    Error: err,
                  });

                  // For delete the last register id when customers adding wrong
                  const sql3 = "DELETE FROM register WHERE id = ?";

                  connection.query(sql3, [reg_id], (err, result) => {
                    if (err)
                      return res.json({
                        Status: "Error",
                        Error: err.sqlMessage,
                      });
                  });
                  return;
                } else {
                  res.json({ Status: "Success" });
                }
              });
            });
          }
        });
      });
    } else {
      res.json({
        Status: "Error",
        Error: "The Password doesn't match!",
      });
      return;
    }
  } else {
    res.json({
      Status: "Error",
      Error: "Please fill all the blank!",
    });
    return;
  }
});

app.get("/allCustomers", (req, res) => {
  const sql = "SELECT * FROM customers";
  connection.query(sql, (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Errer in running sql" });
    else {
      return res.json({ Status: "Success", Result: result });
    }
  });
});

app.get("/getCustomer/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM customers WHERE reg_id = ?";
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
  const sql = "DELETE FROM register WHERE id = ?";

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

// ==================== Admin Management =====================
app.post("/admin/register", jsonParser, (req, res) => {
  const email = req.body.email;
  const urole = "Admin";
  const password = email;
  var reg_id = "";
  const fname = req.body.fname;
  const lname = req.body.lname;
  const tel = req.body.tel;
  const profile_image = "profile.png";

  if (fname !== "" && lname !== "" && email !== "" && tel !== "") {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      // For add register
      const sql1 =
        "INSERT INTO register (email, tel, urole, password) VALUES (?)";
      const values1 = [email, tel, urole, hash];

      connection.query(sql1, [values1], (err, result) => {
        if (err) {
          res.json({
            Status: "Error",
            Error: err,
          });
          return;
        } else {
          // For select last user id
          const sql = "SELECT * FROM register ORDER BY id DESC LIMIT 1";
          connection.query(sql, (err, result) => {
            if (err)
              return res.json({
                Status: "Error",
                Error: err,
              });
            reg_id = result[0].id;

            // For add admins
            const sql2 =
              "INSERT INTO admins (reg_id, email, fname, lname, tel, profile_image) VALUES (?)";
            const values2 = [reg_id, email, fname, lname, tel, profile_image];
            connection.query(sql2, [values2], (err, result) => {
              if (err) {
                res.json({
                  Status: "Error",
                  Error: err,
                });

                // For delete the last register id when customers adding wrong
                const sql3 = "DELETE FROM register WHERE id = ?";

                connection.query(sql3, [reg_id], (err, result) => {
                  if (err)
                    return res.json({
                      Status: "Error",
                      Error: err,
                    });
                });
                return;
              } else {
                res.json({ Status: "Success" });
              }
            });
          });
        }
      });
    });
  } else {
    res.json({
      Status: "Error",
      Error: "Please fill all the blank!",
    });
    return;
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
  const sql = "SELECT * FROM admins WHERE reg_id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Errer in running query" });
    return res.json({ Status: "Success", Result: result });
  });
});

app.put("/updateAdmin/:id", jsonParser, (req, res) => {
  const id = req.params.id;
  const email = req.body.email;
  const tel = req.body.tel;
  const fname = req.body.fname;
  const lname = req.body.lname;
  // const profile_image = req.body.profile_image;
  const password = req.body.password;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    const sql1 =
      "UPDATE register SET `email` = ?, `tel` = ?, `password` = ? WHERE id = ?";
    const sql2 =
      "UPDATE admins SET `email` = ?, `tel` = ?, `fname` = ?, `lname` = ? WHERE reg_id = ?";

    const values1 = [email, tel, hash];
    const values2 = [email, tel, fname, lname];

    connection.query(sql1, [...values1, id], (err, data) => {
      if (err) {
        res.json({ Status: "Error", Error: err });
        return;
      } else {
        // For add admins
        connection.query(sql2, [...values2, id], (err, data) => {
          if (err) {
            res.json({
              Status: "Error",
              Error: err,
            });
            return;
          } else {
            res.json({ Status: "Success" });
            return;
          }
        });
      }
    });
  });
});

app.get("/deleteAdmin/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM register WHERE id = ?";

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

// ==================== Product Management =====================

// The old one of Add product
app.post(
  "/addProductOld",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  (req, res) => {
    const mainImage =
      req.files && req.files["mainImage"] ? req.files["mainImage"][0] : null;
    const otherImages =
      req.files && req.files["images"] ? req.files["images"] : [];

    const price = parseFloat(req.body.price);
    const colors = req.body.colors ? JSON.parse(req.body.colors) : null;

    const otherImagesPaths = otherImages.map((image) => `${image.filename}`);
    const mainImagePath = mainImage ? `${mainImage.filename}` : null;

    const sql = `INSERT INTO products_tb (name, description, price, product_type, main_image_path, colors, other_images_path, popular) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      req.body.name,
      req.body.description,
      isNaN(price) ? null : price,
      req.body.productType,
      mainImagePath,
      colors ? JSON.stringify(colors) : null,
      JSON.stringify(otherImagesPaths),
      req.body.popular ? 1 : 0, // Convert boolean to 1 or 0 for MySQL
    ];

    connection.query(sql, values, (err, result) => {
      if (err) {
        return res.json({
          Status: "Error",
          Error: err,
        });
      }
      return res.json({ Status: "Success" });
    });
  }
);

// The new one of add product
app.post(
  "/addProduct",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  (req, res) => {
    // Check the image file
    const image =
      req.files && req.files["image"] ? req.files["image"][0] : null;
    const images =
      req.files && req.files["gallery"] ? req.files["gallery"] : [];

    // Prepare datas
    const name = req.body.name;
    const description = req.body.description;
    const price = parseFloat(req.body.price);
    const category = req.body.category;
    const colors = req.body.colors ? JSON.parse(req.body.colors) : null;
    const prod_image = image ? `${image.filename}` : null;
    const prod_gallery = images.map((e) => `${e.filename}`);
    const is_popular = req.body.is_popular ? 1 : 0; // Convert boolean to 1 or 0 for MySQL

    const sql = `INSERT INTO products (name, description, price, category, colors, image, gallery, is_popular) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      name,
      description,
      price,
      category,
      colors ? JSON.stringify(colors) : null,
      prod_image,
      prod_gallery ? JSON.stringify(prod_gallery) : null,
      is_popular,
    ];

    connection.query(sql, values, (err, result) => {
      if (err) {
        return res.json({
          Status: "Error",
          Error: err,
        });
      }
      return res.json({ Status: "Success" });
    });
  }
);

app.get("/allProducts", (req, res) => {
  const sql = "SELECT * FROM products";
  connection.query(sql, (err, result) => {
    if (err)
      return res.json({
        Status: "Error",
        Error: err,
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
  const sql = "SELECT count(id) as products FROM products_tb";

  connection.query(sql, (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Errer in running sql" });
    return res.json({ result });
  });
});

// ============== Test API ===============
app.get("/lastUser", (req, res) => {
  const sql = "SELECT * FROM users ORDER BY id DESC LIMIT 1";
  connection.query(sql, (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Errer in running query" });

    return res.json({ Status: "Success", Result: result[0].id });
  });
});

// ==================== Cart Management =====================
app.post("/addToCart", jsonParser, (req, res) => {
  const sql =
    "INSERT INTO carts (cust_id, prod_id, size, color, quantity) VALUES (?)";
  const values = [
    req.body.cust_id,
    req.body.prod_id,
    req.body.size,
    req.body.color,
    req.body.quantity,
  ];
  connection.query(sql, [values], (err, result) => {
    if (err) {
      return res.json({
        Status: "Error",
        Error: err,
      });
    }
    return res.json({ Status: "Success" });
  });
});

app.get("/getProductsInCart2/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM carts WHERE cust_id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err)
      return res.json({
        Status: "Error",
        Error: err,
      });
    return res.json({ Status: "Success", Result: result });
  });
});

app.get("/getProductsInCart/:id", (req, res) => {
  const id = req.params.id;
  // const sql = "SELECT * FROM carts WHERE cust_id = ?";
  const sql = "SELECT c.id, c.cust_id, c.size, c.color, c.quantity, p.name, p.price, p.image FROM carts AS c JOIN products AS p ON p.id = c.prod_id WHERE c.cust_id=?"
  connection.query(sql, [id], (err, result) => {
    if (err)
      return res.json({
        Status: "Error",
        Error: err,
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
        Error: err,
      });
    return res.json({ Status: "Success" });
  });
});

app.get("/countProductInCart", (req, res) => {
  const sql = "SELECT count(id) as products FROM carts";

  connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: "Error", Error: err });
    return res.json({ result });
  });
});

app.listen(5000, () => {
  console.log("Web server listening on port 5000");
});
