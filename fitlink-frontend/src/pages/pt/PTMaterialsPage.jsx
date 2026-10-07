// src/pages/pt/PTMaterialsPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaSortAmountDownAlt,
  FaTrash,
  FaEdit,
  FaShareAlt,
  FaFileAlt,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileImage,
  FaFileVideo,
  FaFilePdf,
} from "react-icons/fa";
import { toast } from "react-toastify";
import PTMainLayout from "@/layouts/pt/PTMainLayout";
import {
  getMyMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  shareMaterial,
} from "@/services/ptMaterialService";
import { getMyPackagesForShare } from "@/services/ptPackageService";
import { uploadMaterialFile } from "@/services/uploadService";

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "document", label: "Document" },
  { value: "sheet", label: "Excel / Sheet" },
  { value: "slide", label: "PowerPoint / Slide" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "link", label: "Link / Other" },
];

function fileTypeIcon(type) {
  switch (type) {
    case "sheet":
      return <FaFileExcel className="text-green-400" />;
    case "slide":
      return <FaFilePowerpoint className="text-orange-400" />;
    case "image":
      return <FaFileImage className="text-blue-400" />;
    case "video":
      return <FaFileVideo className="text-purple-400" />;
    case "pdf":
      return <FaFilePdf className="text-red-400" />;
    default:
      return <FaFileAlt className="text-gray-300" />;
  }
}

export default function PTMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  // file upload
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // form modal
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    type: "document",
    tags: "",
  });

  // share modal
  const [showShare, setShowShare] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackages, setSelectedPackages] = useState([]);

  // dropdown hiển thị danh sách package đã share (theo material)
  const [openSharedDropdown, setOpenSharedDropdown] = useState(null);

  // load materials
  const loadMaterials = async () => {
    try {
      setLoading(true);
      const res = await getMyMaterials();
      setMaterials(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  // load packages để share
  const loadPackages = async () => {
    try {
      const res = await getMyPackagesForShare(); // { data: [...] }
      setPackages(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load packages");
    }
  };

  useEffect(() => {
    loadMaterials();
    loadPackages();
  }, []);

  // --- derived list: search + filter + sort ---
  const filteredMaterials = useMemo(() => {
    let list = [...materials];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.title?.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          (m.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== "all") {
      list = list.filter((m) => m.type === typeFilter);
    }

    if (sort === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      );
    } else if (sort === "oldest") {
      list.sort(
        (a, b) =>
          new Date(a.updatedAt || a.createdAt) -
          new Date(b.updatedAt || b.createdAt)
      );
    } else if (sort === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [materials, search, typeFilter, sort]);

  // --- helpers ---
  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      url: "",
      type: "document",
      tags: "",
    });
    setFile(null);
    setShowForm(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({
      title: m.title || "",
      description: m.description || "",
      url: m.url || "",
      type: m.type || "document",
      tags: (m.tags || []).join(", "),
    });
    setFile(null);
    setShowForm(true);
  };

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // create / update + upload file nếu có
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);

      let url = form.url.trim();

      if (file) {
        const up = await uploadMaterialFile(file);
        url = up.url;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        url,
        type: form.type,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editing) {
        await updateMaterial(editing._id, payload);
        toast.success("Material updated");
      } else {
        await createMaterial(payload);
        toast.success("Material created");
      }

      setShowForm(false);
      setFile(null);
      setForm({
        title: "",
        description: "",
        url: "",
        type: "document",
        tags: "",
      });

      await loadMaterials();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save material");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (m) => {
    const ok = window.confirm(
      `Bạn chắc chắn muốn xoá tài liệu "${m.title}"? Hành động này không thể hoàn tác.`
    );
    if (!ok) return;
    try {
      await deleteMaterial(m._id);
      toast.success("Material deleted");
      await loadMaterials();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete material");
    }
  };

  const openShare = (m) => {
    setShareTarget(m);
    setSelectedPackages((m.sharedWithPackages || []).map((p) => p._id || p));
    setShowShare(true);
  };

  const togglePackage = (id) => {
    setSelectedPackages((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSaveShare = async () => {
    try {
      await shareMaterial(shareTarget._id, selectedPackages);
      toast.success("Shared with packages");
      setShowShare(false);
      await loadMaterials();
    } catch (err) {
      console.error(err);
      toast.error("Failed to share material");
    }
  };

  return (
    <PTMainLayout>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Training materials</h1>
          <p className="mt-1 text-sm text-slate-300">
            Lưu trữ tài liệu tập luyện, dinh dưỡng, video demo… và chia sẻ cho
            từng gói tập.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* search */}
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, tag..."
              className="h-9 rounded-lg border border-slate-700 bg-slate-900/70 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-700 bg-slate-900/70 px-3 text-sm text-slate-100 focus:border-orange-500 focus:outline-none"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* sort */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/70 px-2">
            <FaSortAmountDownAlt className="text-slate-500" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-8 bg-transparent text-sm text-slate-100 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <FaPlus /> Add material
          </button>
        </div>
      </div>

      {/* list */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
        {loading ? (
          <p className="text-sm text-slate-300">Loading materials...</p>
        ) : filteredMaterials.length === 0 ? (
          <p className="text-sm text-slate-400">
            Chưa có tài liệu nào. Bấm{" "}
            <span className="font-semibold">Add material</span> để bắt đầu.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/5 text-slate-400">
                <tr>
                  <th className="px-2 py-2 font-medium">Title</th>
                  <th className="px-2 py-2 font-medium">Type</th>
                  <th className="px-2 py-2 font-medium">Tags</th>
                  <th className="px-2 py-2 font-medium">Shared with</th>
                  <th className="px-2 py-2 font-medium">Updated</th>
                  <th className="px-2 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((m) => {
                  const sharedCount = (m.sharedWithPackages || []).length;
                  const isOpen = openSharedDropdown === m._id;

                  return (
                    <tr
                      key={m._id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="px-2 py-2 align-top">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800">
                            {fileTypeIcon(m.type)}
                          </div>
                          <div>
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-sm font-semibold text-slate-50 hover:text-orange-400"
                            >
                              {m.title}
                            </a>
                            {m.description && (
                              <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                                {m.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-2 align-top text-xs text-slate-300 capitalize">
                        {m.type}
                      </td>

                      <td className="px-2 py-2 align-top text-xs text-slate-300">
                        {(m.tags || []).length === 0 ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {m.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Shared with + dropdown */}
                      <td className="px-2 py-2 align-top text-xs text-slate-300">
                        {sharedCount === 0 ? (
                          <span className="text-slate-500">Not shared</span>
                        ) : (
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenSharedDropdown(
                                  isOpen ? null : m._id
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1 text-[11px] text-slate-100 hover:bg-slate-800"
                            >
                              {sharedCount} package
                              {sharedCount > 1 && "s"}
                              <span className="text-[9px]">▼</span>
                            </button>

                            {isOpen && (
                              <div className="absolute right-0 z-30 mt-1 w-64 rounded-xl border border-slate-700 bg-slate-950 shadow-xl">
                                <div className="border-b border-slate-800 px-3 py-2 text-[11px] font-semibold text-slate-200">
                                  Shared packages
                                </div>
                                <ul className="max-h-56 overflow-y-auto text-[11px]">
                                  {(m.sharedWithPackages || []).map((pkg) => (
                                    <li
                                      key={pkg._id || pkg}
                                      className="border-b border-slate-800 px-3 py-2 last:border-0"
                                    >
                                      <div className="text-slate-50">
                                        {pkg.name || "Unnamed package"}
                                      </div>
                                      {(pkg.totalSessions ||
                                        pkg.durationDays) && (
                                        <div className="text-[10px] text-slate-400">
                                          {pkg.totalSessions && (
                                            <span>
                                              {pkg.totalSessions} sessions
                                            </span>
                                          )}
                                          {pkg.totalSessions &&
                                            pkg.durationDays && (
                                              <span> • </span>
                                            )}
                                          {pkg.durationDays && (
                                            <span>
                                              {pkg.durationDays} days
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-2 py-2 align-top text-xs text-slate-400">
                        {m.updatedAt
                          ? new Date(m.updatedAt).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="px-2 py-2 align-top text-right text-xs">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openShare(m)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-600 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
                          >
                            <FaShareAlt /> Share
                          </button>
                          <button
                            onClick={() => openEdit(m)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-600 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(m)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-600/70 px-2 py-1 text-[11px] text-red-300 hover:bg-red-600/20"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------- Form Modal (Create / Edit) ---------- */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editing ? "Edit material" : "Add new material"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3 text-sm">
              <div>
                <label className="mb-1 block text-slate-300">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChangeForm}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-slate-300">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChangeForm}
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-slate-300">
                  File URL (Drive, PDF, video, image…) hoặc chọn file từ máy
                </label>
                <input
                  name="url"
                  value={form.url}
                  onChange={handleChangeForm}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-orange-500 focus:outline-none"
                />

                {/* Chọn file từ máy */}
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-300"
                  />
                  {file && (
                    <span className="text-[11px] text-orange-300">
                      Đã chọn: {file.name}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[11px] text-slate-400">
                  Nếu chọn file từ máy, hệ thống sẽ upload rồi tự điền URL tự
                  động.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-slate-300">Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChangeForm}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="document">Document</option>
                    <option value="sheet">Excel / Sheet</option>
                    <option value="slide">Slide / PowerPoint</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="link">Link / Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-slate-300">
                    Tags (comma separated)
                  </label>
                  <input
                    name="tags"
                    value={form.tags}
                    onChange={handleChangeForm}
                    placeholder="meal plan, upper body…"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {uploading
                    ? "Uploading..."
                    : editing
                    ? "Save changes"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Share Modal ---------- */}
      {showShare && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaShareAlt /> Share material
              </h2>
              <button
                onClick={() => setShowShare(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <p className="mb-2 text-xs text-slate-300">
              Chọn gói mà bạn muốn chia sẻ tài liệu:
            </p>
            <p className="mb-3 text-sm font-semibold text-orange-200">
              {shareTarget?.title}
            </p>

            <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl bg-slate-950/60 p-3">
              {packages.length === 0 && (
                <p className="text-sm text-slate-400">Bạn chưa có gói tập nào.</p>
              )}
              {packages.map((pkg) => (
                <label
                  key={pkg._id}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-800/80"
                >
                  <div>
                    <p className="text-sm text-slate-50">{pkg.name}</p>
                    {pkg.durationDays && (
                      <p className="text-[11px] text-slate-400">
                        {pkg.totalSessions} buổi • {pkg.durationDays} ngày
                      </p>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedPackages.includes(pkg._id)}
                    onChange={() => togglePackage(pkg._id)}
                    className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-orange-500"
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowShare(false)}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveShare}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Save sharing
              </button>
            </div>
          </div>
        </div>
      )}
    </PTMainLayout>
  );
}
