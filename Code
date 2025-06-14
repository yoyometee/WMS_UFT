/**
 * Austam Good WMS - Google Apps Script Main File
 * Code.gs
 */

// ===== CONFIGURATION =====
const SUPABASE_URL = 'https://mvrumhhztmtssxptiuhk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cnVtaGh6dG10c3N4cHRpdWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Nzk2OTYsImV4cCI6MjA2NTQ1NTY5Nn0.ZerriIfwZfkgR1xWQgeandZhKwXtd68mMZhnn2N9buw'; // เปลี่ยนเป็น API Key ของคุณ

/**
 * Main function to serve the web app
 */
function doGet(e) {
  try {
    const page = e.parameter.page || 'dashboard';
    
    // ตรวจสอบ Google session ก่อน
    const userEmail = Session.getActiveUser().getEmail();
    console.log('User email from session:', userEmail);
    
    // ถ้าไม่มี email หรือเป็นหน้า login ให้แสดงหน้า login
    if (!userEmail || page === 'login') {
      console.log('Redirecting to login page');
      return HtmlService.createTemplateFromFile('login')
        .evaluate()
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    // ตรวจสอบว่า user ได้ login ใน database แล้วหรือไม่
    const loginSessionId = PropertiesService.getScriptProperties().getProperty('current_user_id');
    console.log('Login session ID:', loginSessionId);
    
    if (!loginSessionId) {
      console.log('No login session found, redirecting to login');
      return HtmlService.createTemplateFromFile('login')
        .evaluate()
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    // ดึงข้อมูล user จาก session ID
    const userInfo = getUserById(loginSessionId);
    if (!userInfo || !userInfo.success) {
      console.log('User not found in database, clearing session');
      PropertiesService.getScriptProperties().deleteProperty('current_user_id');
      return HtmlService.createTemplateFromFile('login')
        .evaluate()
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    console.log('User authenticated successfully:', userInfo.data.full_name);
    
    // Load the appropriate page
    const template = HtmlService.createTemplateFromFile('index');
    template.page = page;
    template.userInfo = userInfo.data;
    
    return template.evaluate()
      .setTitle('Austam Good WMS')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return HtmlService.createTemplateFromFile('login')
      .evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * Get user by ID (ฟังก์ชันใหม่)
 */
function getUserById(userId) {
  try {
    console.log('Getting user by ID:', userId);
    const response = supabaseQuery('users', {
      select: 'id,user_id,full_name,position,role,is_active,email',
      eq: { id: userId, is_active: true },
      limit: 1
    });
    
    console.log('User query response:', response);
    
    if (response.error) {
      return { success: false, message: 'Database error: ' + response.error };
    }
    
    if (response.data && response.data.length > 0) {
      return { success: true, data: response.data[0] };
    }
    
    return { success: false, message: 'User not found' };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Include function for HTML templates
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Get current user information (แก้ไขแล้ว)
 */
function getCurrentUser() {
  try {
    const loginSessionId = PropertiesService.getScriptProperties().getProperty('current_user_id');
    if (!loginSessionId) {
      return null;
    }
    
    const userResult = getUserById(loginSessionId);
    return userResult.success ? userResult.data : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// ===== AUTHENTICATION FUNCTIONS =====

/**
 * Login user (แก้ไขแล้ว)
 */
function loginUser(userCredentials) {
  try {
    console.log('Login attempt for user:', userCredentials.username);
    
    // ทดสอบการเชื่อมต่อฐานข้อมูลก่อน
    const testResult = testSupabaseConnection();
    if (!testResult.success) {
      console.error('Database connection failed:', testResult.message);
      return { success: false, message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้' };
    }
    
    const response = supabaseQuery('users', {
      select: '*',
      eq: { 
        user_id: userCredentials.username,
        is_active: true
      },
      limit: 1
    });
    
    console.log('User query response:', response);
    
    if (response.error) {
      console.error('Database query error:', response.error);
      return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล: ' + response.error };
    }
    
    if (response.data && response.data.length > 0) {
      const user = response.data[0];
      console.log('User found:', user.user_id, 'Password hash:', user.password_hash);
      
      // ใช้ === แทน == และเพิ่ม string conversion เพื่อความแน่ใจ
      if (String(user.password_hash) === String(userCredentials.password)) {
        console.log('Password match successful');
        
        // บันทึก login session
        PropertiesService.getScriptProperties().setProperty('current_user_id', String(user.id));
        console.log('Login session saved with ID:', user.id);
        
        return { 
          success: true, 
          user: user,
          message: 'เข้าสู่ระบบสำเร็จ'
        };
      } else {
        console.log('Password mismatch. Expected:', user.password_hash, 'Got:', userCredentials.password);
        return { success: false, message: 'รหัสผ่านไม่ถูกต้อง' };
      }
    } else {
      console.log('User not found for username:', userCredentials.username);
      return { success: false, message: 'ไม่พบผู้ใช้งานนี้ในระบบ หรือบัญชีถูกปิดการใช้งาน' };
    }
    
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ' + error.toString() };
  }
}

// ===== PRODUCT MANAGEMENT FUNCTIONS =====

/**
 * Get all products with current stock
 */
function getAllProducts() {
  try {
    const response = supabaseQuery('current_stock_by_product', {
      select: '*',
      order: { sku: 'asc' }
    });
    return { success: true, data: response.data || [] };
  } catch (error) {
    console.error('Error getting products:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' };
  }
}

/**
 * Get product by SKU
 */
function getProductBySKU(sku) {
  try {
    const response = supabaseQuery('products', {
      select: '*',
      eq: { sku: sku },
      limit: 1
    });
    return { success: true, data: response.data?.[0] || null };
  } catch (error) {
    console.error('Error getting product:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' };
  }
}

/**
 * Create or update product
 */
function saveProduct(productData) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบ' };
    }
    
    // Get product type ID
    const typeResponse = supabaseQuery('product_types', {
      select: 'id',
      eq: { type_name: productData.product_type },
      limit: 1
    });
    
    const productTypeId = typeResponse.data?.[0]?.id;
    
    const productPayload = {
      sku: productData.sku,
      product_name: productData.product_name,
      product_type_id: productTypeId,
      barcode: productData.barcode ? parseInt(productData.barcode) : null,
      unit: productData.unit,
      weight_per_bag: parseFloat(productData.weight_per_bag) || null,
      bags_per_pack: parseInt(productData.bags_per_pack) || null,
      packs_per_pallet: parseInt(productData.packs_per_pallet) || null,
      ti: parseInt(productData.ti) || null,
      hi: parseInt(productData.hi) || null,
      min_stock: parseFloat(productData.min_stock) || null,
      max_stock: parseFloat(productData.max_stock) || null,
      remark: productData.remark || null
    };
    
    // Check if product exists
    const existingProduct = getProductBySKU(productData.sku);
    
    let response;
    if (existingProduct.data) {
      // Update
      response = supabaseUpdate('products', productPayload, { sku: productData.sku });
    } else {
      // Insert
      response = supabaseInsert('products', productPayload);
    }
    
    if (response.error) {
      return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + response.error };
    }
    
    return { success: true, message: 'บันทึกข้อมูลสินค้าเรียบร้อยแล้ว' };
  } catch (error) {
    console.error('Error saving product:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' };
  }
}

// ===== TRANSACTION FUNCTIONS =====

/**
 * Get all transaction types
 */
function getTransactionTypes() {
  try {
    const response = supabaseQuery('transaction_types', {
      select: '*',
      order: { main_type: 'asc', sub_type: 'asc' }
    });
    return { success: true, data: response.data || [] };
  } catch (error) {
    console.error('Error getting transaction types:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทธุรกรรม' };
  }
}

/**
 * Create new transaction
 */
function createTransaction(transactionData) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบ' };
    }
    
    // Generate Tags ID
    const tagsId = generateTagsId(transactionData.main_type);
    
    // Get product ID
    const productResponse = getProductBySKU(transactionData.sku);
    if (!productResponse.success || !productResponse.data) {
      return { success: false, message: 'ไม่พบข้อมูลสินค้า SKU: ' + transactionData.sku };
    }
    
    // Get transaction type ID
    const typeResponse = supabaseQuery('transaction_types', {
      select: 'id',
      eq: { 
        main_type: transactionData.main_type,
        sub_type: transactionData.sub_type
      },
      limit: 1
    });
    
    if (!typeResponse.data || typeResponse.data.length === 0) {
      return { success: false, message: 'ไม่พบประเภทธุรกรรมที่ระบุ' };
    }
    
    // Get location ID if specified
    let locationId = null;
    if (transactionData.location_id) {
      const locationResponse = supabaseQuery('warehouse_locations', {
        select: 'id',
        eq: { location_id: transactionData.location_id },
        limit: 1
      });
      locationId = locationResponse.data?.[0]?.id;
    }
    
    const transactionPayload = {
      tags_id: tagsId,
      transaction_type_id: typeResponse.data[0].id,
      product_id: productResponse.data.id,
      pallet_id: transactionData.pallet_id || null,
      truck_number: transactionData.truck_number || null,
      point_number: transactionData.point_number || null,
      location_id: locationId,
      pallet_color: transactionData.pallet_color || null,
      packs: parseFloat(transactionData.packs) || 0,
      pieces: parseFloat(transactionData.pieces) || 0,
      weight: parseFloat(transactionData.weight) || 0,
      lot_document: transactionData.lot_document || null,
      customer_code: transactionData.customer_code || null,
      customer_name: transactionData.customer_name || null,
      received_date: transactionData.received_date || null,
      expiration_date: transactionData.expiration_date || null,
      delivery_job_number: transactionData.delivery_job_number || null,
      status: transactionData.status || 'ปกติ',
      remark: transactionData.remark || null,
      number_pallet: transactionData.number_pallet || null,
      created_by: currentUser.id,
      created_by_name: currentUser.full_name
    };
    
    const response = supabaseInsert('transactions', transactionPayload);
    
    if (response.error) {
      return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึก: ' + response.error };
    }
    
    // Refresh inventory views
    refreshInventoryViews();
    
    return { 
      success: true, 
      message: 'บันทึกธุรกรรมเรียบร้อยแล้ว',
      tags_id: tagsId
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการสร้างธุรกรรม' };
  }
}

/**
 * Generate unique Tags ID
 */
function generateTagsId(mainType) {
  const timestamp = new Date().getTime().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  const prefix = mainType.substr(0, 2);
  return `${prefix}${timestamp}${random}`;
}

/**
 * Get transactions with filters
 */
function getTransactions(filters = {}) {
  try {
    const queryOptions = {
      select: `
        *,
        products!inner(sku, product_name),
        transaction_types!inner(main_type, sub_type),
        warehouse_locations(location_id),
        users!created_by(full_name)
      `,
      order: { created_at: 'desc' },
      limit: filters.limit || 100
    };
    
    // Add filters
    if (filters.sku) {
      queryOptions.eq = { ...queryOptions.eq, 'products.sku': filters.sku };
    }
    if (filters.main_type) {
      queryOptions.eq = { ...queryOptions.eq, 'transaction_types.main_type': filters.main_type };
    }
    if (filters.date_from) {
      queryOptions.gte = { created_at: filters.date_from };
    }
    if (filters.date_to) {
      queryOptions.lte = { created_at: filters.date_to };
    }
    
    const response = supabaseQuery('transactions', queryOptions);
    return { success: true, data: response.data || [] };
  } catch (error) {
    console.error('Error getting transactions:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลธุรกรรม' };
  }
}

// ===== LOCATION MANAGEMENT FUNCTIONS =====

/**
 * Get all warehouse locations
 */
function getWarehouseLocations() {
  try {
    const response = supabaseQuery('location_occupancy', {
      select: '*',
      order: { location_code: 'asc' }
    });
    return { success: true, data: response.data || [] };
  } catch (error) {
    console.error('Error getting locations:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลที่เก็บ' };
  }
}

/**
 * Get available locations
 */
function getAvailableLocations() {
  try {
    const response = supabaseQuery('warehouse_locations', {
      select: '*',
      eq: { status: 'ว่าง' },
      order: { location_id: 'asc' }
    });
    return { success: true, data: response.data || [] };
  } catch (error) {
    console.error('Error getting available locations:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลที่เก็บที่ว่าง' };
  }
}

// ===== REPORT FUNCTIONS =====

/**
 * Get current stock report
 */
function getCurrentStockReport() {
  try {
    const response = supabaseQuery('current_stock_by_product', {
      select: '*',
      order: { sku: 'asc' }
    });
    return { success: true, data: response.data || [] };
  } catch (error) {
    console.error('Error getting stock report:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการสร้างรายงานสต๊อก' };
  }
}

/**
 * Get pick face inventory report
 */
function getPickFaceReport() {
  try {
    const response = supabaseQuery('pick_face_inventory', {
      select: '*',
      order: { sku: 'asc' }
    });
    return { success: true, data: response.data || [] };
  } catch (error) {
    console.error('Error getting pick face report:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการสร้างรายงาน Pick Face' };
  }
}

/**
 * Get location occupancy report
 */
function getLocationReport() {
  return getWarehouseLocations();
}

// ===== BOM MANAGEMENT FUNCTIONS =====

/**
 * Get all BOMs
 */
function getAllBOMs() {
  try {
    const response = supabaseQuery('bill_of_materials', {
      select: `
        *,
        products!finished_product_sku(sku, product_name),
        bom_components(
          *,
          products!component_sku(sku, product_name)
        )
      `,
      eq: { is_active: true },
      order: { finished_product_sku: 'asc' }
    });
    return { success: true, data: response.data || [] };
  } catch (error) {
    console.error('Error getting BOMs:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล BOM' };
  }
}

/**
 * Save BOM
 */
function saveBOM(bomData) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบ' };
    }
    
    // Create BOM header
    const bomPayload = {
      finished_product_sku: bomData.finished_product_sku,
      bom_version: 1,
      is_active: true
    };
    
    const bomResponse = supabaseInsert('bill_of_materials', bomPayload);
    if (bomResponse.error) {
      return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึก BOM' };
    }
    
    const bomId = bomResponse.data[0].id;
    
    // Create BOM components
    for (const component of bomData.components) {
      const componentPayload = {
        bom_id: bomId,
        component_sku: component.sku,
        component_type: component.type,
        quantity: parseFloat(component.quantity) || 1,
        unit: component.unit
      };
      
      supabaseInsert('bom_components', componentPayload);
    }
    
    return { success: true, message: 'บันทึก BOM เรียบร้อยแล้ว' };
  } catch (error) {
    console.error('Error saving BOM:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึก BOM' };
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Refresh materialized views
 */
function refreshInventoryViews() {
  try {
    supabaseRPC('refresh_inventory_views');
    return { success: true };
  } catch (error) {
    console.error('Error refreshing views:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการรีเฟรชข้อมูล' };
  }
}

/**
 * Get dashboard statistics
 */
function getDashboardStats() {
  try {
    // Get total products
    const productsResponse = supabaseQuery('products', {
      select: 'id',
      eq: { is_active: true }
    });
    
    // Get total transactions today
    const today = new Date().toISOString().split('T')[0];
    const transactionsResponse = supabaseQuery('transactions', {
      select: 'id',
      gte: { created_at: today }
    });
    
    // Get occupied locations
    const locationsResponse = supabaseQuery('warehouse_locations', {
      select: 'id',
      eq: { status: 'ไม่ว่าง' }
    });
    
    // Get low stock products
    const lowStockResponse = supabaseQuery('current_stock_by_product', {
      select: 'sku, product_name, total_pieces_normal',
      lt: { total_pieces_normal: 100 }
    });
    
    return {
      success: true,
      data: {
        total_products: productsResponse.data?.length || 0,
        transactions_today: transactionsResponse.data?.length || 0,
        occupied_locations: locationsResponse.data?.length || 0,
        low_stock_products: lowStockResponse.data?.length || 0,
        low_stock_items: lowStockResponse.data || []
      }
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลแดชบอร์ด' };
  }
}

/**
 * Search products by name or SKU
 */
function searchProducts(searchTerm) {
  try {
    const response = supabaseQuery('products', {
      select: '*',
      or: [
        { sku: `ilike.%${searchTerm}%` },
        { product_name: `ilike.%${searchTerm}%` }
      ],
      limit: 20
    });
    return { success: true, data: response.data || [] };
  } catch (error) {
    console.error('Error searching products:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการค้นหาสินค้า' };
  }
}
