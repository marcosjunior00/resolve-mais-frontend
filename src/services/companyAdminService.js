import { api } from "./api";

const withAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const companyAdminService = {
  list: async (params = {}) => {
    const response = await api.get("/companies/my-company/admins", {
      headers: withAuthHeader(),
      params,
    });
    return response.data;
  },

  add: async (payload) => {
    const response = await api.post("/companies/my-company/admins", payload, {
      headers: withAuthHeader(),
    });
    return response.data;
  },

  setPrimary: async (adminUserId) => {
    const response = await api.patch(
      `/companies/my-company/admins/${adminUserId}/primary`,
      {},
      { headers: withAuthHeader() }
    );
    return response.data;
  },

  remove: async (adminUserId) => {
    const response = await api.delete(`/companies/my-company/admins/${adminUserId}`, {
      headers: withAuthHeader(),
    });
    return response.data;
  },

  listEmployees: async (params = {}) => {
    const response = await api.get("/companies/my-company/employees", {
      headers: withAuthHeader(),
      params,
    });
    return response.data;
  },

  getAiInsights: async () => {
    const response = await api.get("/companies/my-company/ai-insights", {
      headers: withAuthHeader(),
    });
    return response.data;
  },

  updateCompanyProfile: async (payload) => {
    const response = await api.patch("/companies/my-company/profile", payload, {
      headers: withAuthHeader(),
    });
    return response.data;
  },

  listComplaintTitles: async () => {
    const response = await api.get("/companies/my-company/complaint-titles", {
      headers: withAuthHeader(),
    });
    return response.data;
  },

  addComplaintTitle: async (payload) => {
    const response = await api.post("/companies/my-company/complaint-titles", payload, {
      headers: withAuthHeader(),
    });
    return response.data;
  },

  removeComplaintTitle: async (complaintTitleId) => {
    const response = await api.delete(`/companies/my-company/complaint-titles/${complaintTitleId}`, {
      headers: withAuthHeader(),
    });
    return response.data;
  },

  addEmployee: async (payload) => {
    const response = await api.post("/companies/my-company/employees", payload, {
      headers: withAuthHeader(),
    });
    return response.data;
  },

  updateEmployee: async (employeeUserId, payload) => {
    const response = await api.patch(`/companies/my-company/employees/${employeeUserId}`, payload, {
      headers: withAuthHeader(),
    });
    return response.data;
  },

  removeEmployee: async (employeeUserId) => {
    const response = await api.delete(`/companies/my-company/employees/${employeeUserId}`, {
      headers: withAuthHeader(),
    });
    return response.data;
  },
};

export default companyAdminService;
