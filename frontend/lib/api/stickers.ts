const STICKERS_API = {
  list: "/admin/stickers",               // GET
  upload: "/admin/stickers/upload",      // POST
  delete: (id: string) => `/admin/stickers/${id}`, // DELETE
  disable: (id: string) => `/admin/stickers/${id}/disable`, // PATCH (optional)
};

export default STICKERS_API;
