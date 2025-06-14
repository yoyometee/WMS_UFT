/**
 * Supabase Service for Google Apps Script
 * SupabaseService.gs
 */

/**
 * Generic query function for Supabase
 */
function supabaseQuery(table, options = {}) {
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    const params = [];
    
    // Select fields
    if (options.select) {
      params.push(`select=${encodeURIComponent(options.select)}`);
    }
    
    // Filters
    if (options.eq) {
      Object.keys(options.eq).forEach(key => {
        params.push(`${key}=eq.${encodeURIComponent(options.eq[key])}`);
      });
    }
    
    if (options.neq) {
      Object.keys(options.neq).forEach(key => {
        params.push(`${key}=neq.${encodeURIComponent(options.neq[key])}`);
      });
    }
    
    if (options.gt) {
      Object.keys(options.gt).forEach(key => {
        params.push(`${key}=gt.${encodeURIComponent(options.gt[key])}`);
      });
    }
    
    if (options.gte) {
      Object.keys(options.gte).forEach(key => {
        params.push(`${key}=gte.${encodeURIComponent(options.gte[key])}`);
      });
    }
    
    if (options.lt) {
      Object.keys(options.lt).forEach(key => {
        params.push(`${key}=lt.${encodeURIComponent(options.lt[key])}`);
      });
    }
    
    if (options.lte) {
      Object.keys(options.lte).forEach(key => {
        params.push(`${key}=lte.${encodeURIComponent(options.lte[key])}`);
      });
    }
    
    if (options.like) {
      Object.keys(options.like).forEach(key => {
        params.push(`${key}=like.${encodeURIComponent(options.like[key])}`);
      });
    }
    
    if (options.ilike) {
      Object.keys(options.ilike).forEach(key => {
        params.push(`${key}=ilike.${encodeURIComponent(options.ilike[key])}`);
      });
    }
    
    if (options.or) {
      const orConditions = options.or.map(condition => {
        const key = Object.keys(condition)[0];
        const value = condition[key];
        
        if (typeof value === 'string' && value.startsWith('ilike.')) {
          return `${key}=${value}`;
        }
        return `${key}=eq.${encodeURIComponent(value)}`;
      }).join(',');
      params.push(`or=(${orConditions})`);
    }
    
    // Ordering
    if (options.order) {
      Object.keys(options.order).forEach(key => {
        params.push(`order=${key}.${options.order[key]}`);
      });
    }
    
    // Limits
    if (options.limit) {
      params.push(`limit=${options.limit}`);
    }
    
    if (options.offset) {
      params.push(`offset=${options.offset}`);
    }
    
    // Add range for exact count
    if (options.count) {
      params.push('count=exact');
    }
    
    // Build final URL
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    console.log('Supabase Query URL:', url);
    
    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': options.count ? 'count=exact' : 'return=representation'
      }
    });
    
    const responseText = response.getContentText();
    const statusCode = response.getResponseCode();
    
    if (statusCode !== 200) {
      console.error('Supabase query error:', statusCode, responseText);
      return { error: `HTTP ${statusCode}: ${responseText}`, data: null };
    }
    
    const data = JSON.parse(responseText);
    
    // Get count from headers if requested
    let count = null;
    if (options.count) {
      const headers = response.getHeaders();
      const rangeHeader = headers['content-range'] || headers['Content-Range'];
      if (rangeHeader) {
        const match = rangeHeader.match(/\/(\d+)$/);
        if (match) {
          count = parseInt(match[1]);
        }
      }
    }
    
    return { data, count, error: null };
  } catch (error) {
    console.error('Supabase query error:', error);
    return { error: error.toString(), data: null };
  }
}

/**
 * Insert data into Supabase table
 */
function supabaseInsert(table, data, options = {}) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}`;
    
    const payload = Array.isArray(data) ? data : [data];
    
    const response = UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      payload: JSON.stringify(payload)
    });
    
    const responseText = response.getContentText();
    const statusCode = response.getResponseCode();
    
    if (statusCode !== 201) {
      console.error('Supabase insert error:', statusCode, responseText);
      return { error: `HTTP ${statusCode}: ${responseText}`, data: null };
    }
    
    const responseData = JSON.parse(responseText);
    return { data: responseData, error: null };
  } catch (error) {
    console.error('Supabase insert error:', error);
    return { error: error.toString(), data: null };
  }
}

/**
 * Update data in Supabase table
 */
function supabaseUpdate(table, data, filters, options = {}) {
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    const params = [];
    
    // Add filters for update
    if (filters) {
      Object.keys(filters).forEach(key => {
        params.push(`${key}=eq.${encodeURIComponent(filters[key])}`);
      });
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    const response = UrlFetchApp.fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      payload: JSON.stringify(data)
    });
    
    const responseText = response.getContentText();
    const statusCode = response.getResponseCode();
    
    if (statusCode !== 200) {
      console.error('Supabase update error:', statusCode, responseText);
      return { error: `HTTP ${statusCode}: ${responseText}`, data: null };
    }
    
    const responseData = JSON.parse(responseText);
    return { data: responseData, error: null };
  } catch (error) {
    console.error('Supabase update error:', error);
    return { error: error.toString(), data: null };
  }
}

/**
 * Delete data from Supabase table
 */
function supabaseDelete(table, filters, options = {}) {
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    const params = [];
    
    // Add filters for delete
    if (filters) {
      Object.keys(filters).forEach(key => {
        params.push(`${key}=eq.${encodeURIComponent(filters[key])}`);
      });
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    const response = UrlFetchApp.fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    
    const responseText = response.getContentText();
    const statusCode = response.getResponseCode();
    
    if (statusCode !== 200) {
      console.error('Supabase delete error:', statusCode, responseText);
      return { error: `HTTP ${statusCode}: ${responseText}`, data: null };
    }
    
    const responseData = responseText ? JSON.parse(responseText) : [];
    return { data: responseData, error: null };
  } catch (error) {
    console.error('Supabase delete error:', error);
    return { error: error.toString(), data: null };
  }
}

/**
 * Call Supabase RPC function
 */
function supabaseRPC(functionName, params = {}, options = {}) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/rpc/${functionName}`;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      payload: JSON.stringify(params)
    });
    
    const responseText = response.getContentText();
    const statusCode = response.getResponseCode();
    
    if (statusCode !== 200) {
      console.error('Supabase RPC error:', statusCode, responseText);
      return { error: `HTTP ${statusCode}: ${responseText}`, data: null };
    }
    
    const responseData = responseText ? JSON.parse(responseText) : null;
    return { data: responseData, error: null };
  } catch (error) {
    console.error('Supabase RPC error:', error);
    return { error: error.toString(), data: null };
  }
}

/**
 * Batch insert with error handling
 */
function supabaseBatchInsert(table, dataArray, batchSize = 1000) {
  try {
    const results = [];
    const errors = [];
    
    // Split into batches
    for (let i = 0; i < dataArray.length; i += batchSize) {
      const batch = dataArray.slice(i, i + batchSize);
      
      try {
        const response = supabaseInsert(table, batch);
        if (response.error) {
          errors.push({ batch: i / batchSize + 1, error: response.error });
        } else {
          results.push(...response.data);
        }
      } catch (batchError) {
        errors.push({ batch: i / batchSize + 1, error: batchError.toString() });
      }
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < dataArray.length) {
        Utilities.sleep(100);
      }
    }
    
    return {
      success: errors.length === 0,
      inserted: results.length,
      errors: errors,
      data: results
    };
  } catch (error) {
    console.error('Batch insert error:', error);
    return {
      success: false,
      inserted: 0,
      errors: [{ batch: 'all', error: error.toString() }],
      data: []
    };
  }
}

/**
 * Test Supabase connection
 */
function testSupabaseConnection() {
  try {
    const response = supabaseQuery('users', { 
      select: 'id',
      limit: 1
    });
    
    if (response.error) {
      console.error('Supabase connection test failed:', response.error);
      return { success: false, message: 'Connection failed: ' + response.error };
    }
    
    console.log('Supabase connection test successful');
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return { success: false, message: 'Connection error: ' + error.toString() };
  }
}

/**
 * Get table schema information
 */
function getTableSchema(tableName) {
  try {
    const response = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'OPTIONS',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const openApiSpec = JSON.parse(response.getContentText());
    const tableInfo = openApiSpec.definitions?.[tableName];
    
    return { success: true, schema: tableInfo };
  } catch (error) {
    console.error('Error getting table schema:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Execute custom SQL (requires service role key)
 */
function executeCustomSQL(sql, params = []) {
  try {
    // Note: This requires service role key, not anon key
    // Use with caution and proper security measures
    
    const response = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY, // You need to add this to your config
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({ sql, params })
    });
    
    const responseData = JSON.parse(response.getContentText());
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error executing custom SQL:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Health check for all core tables
 */
function checkDatabaseHealth() {
  const tables = [
    'users',
    'products', 
    'warehouse_locations',
    'transactions',
    'transaction_types',
    'current_stock_by_product'
  ];
  
  const results = {};
  
  tables.forEach(table => {
    try {
      const response = supabaseQuery(table, { 
        select: 'count',
        count: true,
        limit: 0
      });
      
      results[table] = {
        accessible: !response.error,
        count: response.count || 0,
        error: response.error || null
      };
    } catch (error) {
      results[table] = {
        accessible: false,
        count: 0,
        error: error.toString()
      };
    }
  });
  
  return results;
}
