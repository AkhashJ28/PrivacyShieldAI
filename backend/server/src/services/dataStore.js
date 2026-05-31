const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const supabase = require("../config/supabase");

const dataDir = path.join(__dirname, "../../data");
const dbPath = path.join(dataDir, "db.json");

const supabaseRequested =
  process.env.STORAGE_PROVIDER === "supabase" || process.env.USE_SUPABASE === "true";

const supabaseEnabled =
  supabaseRequested &&
  Boolean(process.env.SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_ANON_KEY) &&
  !process.env.SUPABASE_URL.includes("your-");

const defaultUsers = [
  {
    id: "admin",
    name: process.env.ADMIN_NAME || "System Admin",
    email: process.env.ADMIN_EMAIL || "admin@privacyshield.local",
    password: process.env.ADMIN_PASSWORD || "admin123",
    role: "admin",
    status: "active",
  },
  {
    id: "officer",
    name: process.env.OFFICER_NAME || "Investigation Officer",
    email: process.env.OFFICER_EMAIL || "officer@privacyshield.local",
    password: process.env.OFFICER_PASSWORD || "officer123",
    role: "officer",
    status: "active",
  },
];

function ensureDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(
      dbPath,
      JSON.stringify(
        {
          documents: [],
          access_requests: [],
          audit_logs: [],
          users: defaultUsers,
        },
        null,
        2
      )
    );
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function withoutPassword(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function sortNewest(items) {
  return [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function listDocuments() {
  if (supabaseEnabled) {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  const db = readDb();
  return sortNewest(db.documents);
}

async function getDocument(id) {
  if (supabaseEnabled) {
    const { data, error } = await supabase.from("documents").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  }

  const db = readDb();
  return db.documents.find((document) => document.id === id) || null;
}

async function createDocument(document) {
  if (supabaseEnabled) {
    const { data, error } = await supabase.from("documents").insert([document]).select();
    if (error) throw error;
    return data[0];
  }

  const db = readDb();
  const row = {
    id: uuidv4(),
    created_at: new Date().toISOString(),
    ...document,
  };
  db.documents.unshift(row);
  writeDb(db);
  return row;
}

async function listRequests() {
  if (supabaseEnabled) {
    const { data, error } = await supabase
      .from("access_requests")
      .select(
        `
        *,
        documents (
          original_name,
          file_url
        )
      `
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  const db = readDb();
  return sortNewest(db.access_requests).map((request) => ({
    ...request,
    documents: db.documents.find((document) => document.id === request.document_id) || null,
  }));
}

async function createRequest({ document_id, officer_name, reason }) {
  if (supabaseEnabled) {
    const { data, error } = await supabase
      .from("access_requests")
      .insert([{ document_id, officer_name, reason }])
      .select();
    if (error) throw error;
    return data[0];
  }

  const db = readDb();
  const request = {
    id: uuidv4(),
    document_id,
    officer_name,
    reason,
    status: "pending",
    created_at: new Date().toISOString(),
  };
  db.access_requests.unshift(request);
  writeDb(db);
  return request;
}

async function updateRequestStatus(id, status) {
  if (supabaseEnabled) {
    const { data, error } = await supabase
      .from("access_requests")
      .update({ status })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  }

  const db = readDb();
  const request = db.access_requests.find((item) => item.id === id);
  if (!request) return null;
  request.status = status;
  request.updated_at = new Date().toISOString();
  writeDb(db);
  return request;
}

async function listAuditLogs() {
  if (supabaseEnabled) {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  const db = readDb();
  return sortNewest(db.audit_logs);
}

async function createAuditLog(log) {
  if (supabaseEnabled) {
    const { data, error } = await supabase.from("audit_logs").insert([log]).select();
    if (error) throw error;
    return data?.[0] || null;
  }

  const db = readDb();
  const row = {
    id: uuidv4(),
    created_at: new Date().toISOString(),
    ...log,
  };
  db.audit_logs.unshift(row);
  writeDb(db);
  return row;
}

async function listUsers() {
  if (supabaseEnabled) {
    const { data, error } = await supabase
      .from("users")
      .select("id,name,email,role,status,created_at")
      .order("created_at", { ascending: false });
    if (!error) return data || [];
  }

  const db = readDb();
  return db.users.map(withoutPassword);
}

async function authenticateUser(email, password) {
  const normalizedEmail = String(email || "").toLowerCase().trim();

  if (supabaseEnabled) {
    const { data, error } = await supabase
      .from("users")
      .select("id,name,email,role,status,password")
      .eq("email", normalizedEmail)
      .single();
    if (error || !data || data.password !== password || data.status !== "active") return null;
    return withoutPassword(data);
  }

  const db = readDb();
  const user = db.users.find(
    (item) =>
      item.email.toLowerCase() === normalizedEmail &&
      item.password === password &&
      item.status === "active"
  );
  return withoutPassword(user);
}

async function uploadToSupabaseStorage({ fileName, fileBuffer, contentType }) {
  if (!supabaseEnabled) return null;

  const { error } = await supabase.storage.from("documents").upload(fileName, fileBuffer, {
    contentType,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("documents").getPublicUrl(fileName);
  return data.publicUrl;
}

module.exports = {
  supabaseEnabled,
  authenticateUser,
  createAuditLog,
  createDocument,
  createRequest,
  getDocument,
  listAuditLogs,
  listDocuments,
  listRequests,
  listUsers,
  updateRequestStatus,
  uploadToSupabaseStorage,
};
