import Customer from "../models/customers.models.js";

// ✅ Create Customer
export const createCustomer = async (req, res) => {
  try {
    const { name, phoneNumber, status } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!phoneNumber || phoneNumber.trim() === "") {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    // Check duplicate
    const existing = await Customer.findOne({ where: { phoneNumber } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Phone number already exists" });
    }

    const newCustomer = await Customer.create({ name, phoneNumber, status });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: newCustomer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create customer", error: error.message });
  }
};

// ✅ Get All Customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();

    res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: customers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch customers", error: error.message });
  }
};

// ✅ Get Customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({
      success: true,
      message: "Customer fetched successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch customer", error: error.message });
  }
};

// ✅ Update Customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, status } = req.body;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    // Check phone number duplication
    if (phoneNumber && phoneNumber !== customer.phoneNumber) {
      const existing = await Customer.findOne({ where: { phoneNumber } });
      if (existing) {
        return res.status(409).json({ success: false, message: "Phone number already exists" });
      }
    }

    await customer.update({
      name: name ?? customer.name,
      phoneNumber: phoneNumber ?? customer.phoneNumber,
      status: status ?? customer.status,
    });

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update customer", error: error.message });
  }
};

// ✅ Delete Customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    await customer.destroy();

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete customer", error: error.message });
  }
};
