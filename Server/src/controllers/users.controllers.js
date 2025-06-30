import User from "../models/users.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";

// ✅ Validation Helper
const validateUserInput = (
  name,
  contact_number,
  password,
  isUpdate = false
) => {
  const errors = [];

  if (!isUpdate || name !== undefined) {
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.push("Name is required and must be at least 2 characters.");
    }
  }

  if (!isUpdate || contact_number !== undefined) {
    const contactRegex = /^[0-9]{10}$/;
    if (!contact_number || !contactRegex.test(contact_number)) {
      errors.push("Contact number must be a 10-digit valid number.");
    }
  }

  if (!isUpdate || password !== undefined) {
    if (!password || password.length < 6) {
      errors.push(
        "Password is required and must be at least 6 characters long."
      );
    }
  }

  return errors;
};

export const createUser = async (req, res) => {
  try {
    const { name, contact_number, password } = req.body;
    const errors = validateUserInput(name, contact_number, password);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ name }, { contact_number }],
      },
    });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      id: uuidv4(),
      name,
      contact_number,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "Registration successful." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { contact_number, password } = req.body;

    if (!contact_number || !password) {
      return res
        .status(400)
        .json({ message: "Contact number and password are required." });
    }

    const user = await User.findOne({
      where: { contact_number, status: true },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        contact_number: user.contact_number,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

export const findAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { status: true },
      attributes: ["id", "name", "contact_number", "created_at"],
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

export const findUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      where: { id, status: true },
      attributes: ["id", "name", "contact_number", "created_at"],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_number, password } = req.body;
    const errors = validateUserInput(name, contact_number, password, true);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const user = await User.findOne({ where: { id, status: true } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    user.name = name || user.name;
    user.contact_number = contact_number || user.contact_number;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ where: { id, status: true } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.status = false;
    await user.save();
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};
