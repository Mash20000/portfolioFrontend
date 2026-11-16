import { api } from "./api.js";
import { supabase } from "./supabase.js";

async function token() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

// Admin API: every call carries the Supabase access token; the server verifies it and the admin role.
export const adminApi = {
  get: async (p) => api.get(`/admin${p}`, { token: await token() }),
  post: async (p, body) => api.post(`/admin${p}`, body, { token: await token() }),
  put: async (p, body) => api.put(`/admin${p}`, body, { token: await token() }),
  patch: async (p, body) => api.patch(`/admin${p}`, body, { token: await token() }),
  delete: async (p) => api.delete(`/admin${p}`, { token: await token() }),
  upload: async (file, bucket) => {
    const fd = new FormData();
    fd.append("bucket", bucket);
    fd.append("file", file); // bucket must come before file so multer sees it
    return api.post("/admin/upload", fd, { token: await token() });
  },
};
