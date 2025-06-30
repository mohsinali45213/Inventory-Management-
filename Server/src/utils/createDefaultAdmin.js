import Admin from "../models/admin.models.js";

export const createDefaultAdmin = async () => {
  try {
    // Check if any admin exists
    const existingAdmin = await Admin.findOne();
    
    if (!existingAdmin) {
      // Create default admin
      const defaultAdmin = await Admin.create({
        name: "Super Admin",
        phone: "1234567890",
        password: "admin123",
        status: "active"
      });
      
      console.log("✅ Default admin created successfully:");
      console.log(`   Name: ${defaultAdmin.name}`);
      console.log(`   Phone: ${defaultAdmin.phone}`);
      console.log(`   Password: admin123`);
      console.log("   Please change the default password after first login!");
    } else {
      console.log("✅ Admin already exists, skipping default admin creation");
    }
  } catch (error) {
    console.error("❌ Error creating default admin:", error.message);
  }
}; 