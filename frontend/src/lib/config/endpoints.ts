export const endpoints = {
  auth: {
    login:   "/api/auth/login",
    logout:  "/api/auth/logout",
    refresh: "/api/auth/refresh",
    me:      "/api/auth/me",
  },

  user: {
    list:       "/api/users",
    create:     "/api/users",
    get:        (id: number) => `/api/users/${id}`,
    update:     (id: number) => `/api/users/${id}`,
    delete:     (id: number) => `/api/users/${id}`,
  },

  role: {
    list: "/api/roles",
  },

  customer: {
    list:   "/api/customers",
    create: "/api/customers",
    get:    (id: number) => `/api/customers/${id}`,
    update: (id: number) => `/api/customers/${id}`,
    delete: (id: number) => `/api/customers/${id}`,
  },

  supplier: {
    list:   "/api/suppliers",
    create: "/api/suppliers",
    get:    (id: number) => `/api/suppliers/${id}`,
    update: (id: number) => `/api/suppliers/${id}`,
    delete: (id: number) => `/api/suppliers/${id}`,
  },

  product: {
    list:   "/api/products",
    create: "/api/products",
    get:    (id: number) => `/api/products/${id}`,
    update: (id: number) => `/api/products/${id}`,
    delete: (id: number) => `/api/products/${id}`,
  },

  quotation: {
    list:        "/api/quotations",
    create:      "/api/quotations",
    get:         (id: number) => `/api/quotations/${id}`,
    update:      (id: number) => `/api/quotations/${id}`,
    delete:      (id: number) => `/api/quotations/${id}`,
    updateStatus:(id: number) => `/api/quotations/${id}/status`,
    pdf:         (id: number) => `/api/quotations/${id}/pdf`,
  },

  purchaseOrder: {
    list:          "/api/purchase-orders",
    create:        "/api/purchase-orders",
    get:           (id: number) => `/api/purchase-orders/${id}`,
    update:        (id: number) => `/api/purchase-orders/${id}`,
    delete:        (id: number) => `/api/purchase-orders/${id}`,
    updateStatus:  (id: number) => `/api/purchase-orders/${id}/status`,
    receipts:      (id: number) => `/api/purchase-orders/${id}/receipts`,
    history:       (id: number) => `/api/purchase-orders/${id}/history`,
    fromQuotation: (quotationId: number) => `/api/purchase-orders/from-quotation/${quotationId}`,
  },

  upload: {
    import: "/api/import",
  },

  chat: {
    ask:      "/api/chat",
    sessions: "/api/chat/sessions",
  },
} as const
