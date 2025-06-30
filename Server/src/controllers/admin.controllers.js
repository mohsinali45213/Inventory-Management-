import Admin from "../models/admin.models.js";
import jwt from "jsonwebtoken";

// ✅ Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validation
    if (!phone || phone.trim() === "") {
      return res.status(400).json({ success: false, message: "Phone is required" });
    }
    if (!password || password.trim() === "") {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    // Find admin by phone
    const admin = await Admin.findOne({ where: { phone, status: "active" } });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, phone: admin.phone, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          phone: admin.phone,
          status: admin.status,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to login", error: error.message });
  }
};

// ✅ Create Admin (Only by existing admins)
export const createAdmin = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!phone || phone.trim() === "") {
      return res.status(400).json({ success: false, message: "Phone is required" });
    }
    if (!password || password.trim() === "") {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    // Check duplicate phone
    const existing = await Admin.findOne({ where: { phone } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Phone number already exists" });
    }

    const newAdmin = await Admin.create({ name, phone, password });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: newAdmin.id,
        name: newAdmin.name,
        phone: newAdmin.phone,
        status: newAdmin.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create admin", error: error.message });
  }
};

// ✅ Get All Admins (Only by existing admins)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: { exclude: ["password"] },
    });

    res.status(200).json({
      success: true,
      message: "Admins fetched successfully",
      data: admins,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch admins", error: error.message });
  }
};

// ✅ Get Admin by ID (Only by existing admins)
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      message: "Admin fetched successfully",
      data: admin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch admin", error: error.message });
  }
};

// ✅ Update Admin (Only by existing admins)
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, password, status } = req.body;

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Check phone number duplication
    if (phone && phone !== admin.phone) {
      const existing = await Admin.findOne({ where: { phone } });
      if (existing) {
        return res.status(409).json({ success: false, message: "Phone number already exists" });
      }
    }

    await admin.update({
      name: name ?? admin.name,
      phone: phone ?? admin.phone,
      password: password ?? admin.password,
      status: status ?? admin.status,
    });

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: {
        id: admin.id,
        name: admin.name,
        phone: admin.phone,
        status: admin.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update admin", error: error.message });
  }
};

// ✅ Delete Admin (Only by existing admins)
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    await admin.destroy();

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete admin", error: error.message });
  }
};

// ✅ Get Current Admin Profile
export const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      message: "Admin profile fetched successfully",
      data: admin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch admin profile", error: error.message });
  }
}; 