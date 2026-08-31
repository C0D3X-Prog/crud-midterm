const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

app.use(express.json());
app.use(express.static("public"));

app.get("/api/items", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM items ORDER BY id DESC"
        );

        res.json(rows);
    } catch (error) {
        console.error("GET error:", error);
        res.status(500).json({
            error: "Failed to retrieve items"
        });
    }
});


app.post("/api/items", async (req, res) => {
    try {
        const { name, description, quantity } = req.body;

        if (!name || quantity === undefined) {
            return res.status(400).json({
                error: "Name and quantity are required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO items (name, description, quantity)
             VALUES (?, ?, ?)`,
            [name, description || null, quantity]
        );

        const [rows] = await db.query(
            "SELECT * FROM items WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json(rows[0]);

    } catch (error) {
        console.error("POST error:", error);
        res.status(500).json({
            error: "Failed to create item"
        });
    }
});


app.put("/api/items/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, quantity } = req.body;

        if (!name || quantity === undefined) {
            return res.status(400).json({
                error: "Name and quantity are required"
            });
        }

        const [result] = await db.query(
            `UPDATE items
             SET name = ?, description = ?, quantity = ?
             WHERE id = ?`,
            [name, description || null, quantity, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Item not found"
            });
        }

        const [rows] = await db.query(
            "SELECT * FROM items WHERE id = ?",
            [id]
        );

        res.json(rows[0]);

    } catch (error) {
        console.error("PUT error:", error);
        res.status(500).json({
            error: "Failed to update item"
        });
    }
});


app.delete("/api/items/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM items WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Item not found"
            });
        }

        res.json({
            message: "Item deleted successfully"
        });

    } catch (error) {
        console.error("DELETE error:", error);
        res.status(500).json({
            error: "Failed to delete item"
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});