"use client";

import { useState } from "react";
import type { TaskWithAssignee, TaskCategory } from "@/types/supabase";
import { TASK_CATEGORIES, CategoryBadge } from "./TaskCategoryFilter";
import {
  updateOrganizationTask,
  deleteOrganizationTask,
  assignOrganizationTask,
} from "@/app/(dashboard)/dashboard/organizations/[id]/tasks/actions";
import toast from "react-hot-toast";

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high" | "critical";

interface Props {
  task: TaskWithAssignee;
  organizationId: string;
  members: Array<{
    id: string;
    user_id: string;
    role: string;
    profiles: {
      id: string;
      full_name: string | null;
      email: string;
      avatar_url: string | null;
    } | null;
  }>;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

const PRIORITY_CONFIG = {
  critical: { label: "Kritik", icon: "🔴", color: "text-red-600" },
  high: { label: "Yüksek", icon: "🟠", color: "text-orange-600" },
  medium: { label: "Orta", icon: "🟡", color: "text-yellow-600" },
  low: { label: "Düşük", icon: "🟢", color: "text-green-600" },
};

const STATUS_CONFIG = {
  todo: {
    label: "Yapılacak",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
  },
  in_progress: {
    label: "Devam Ediyor",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
  },
  done: {
    label: "Tamamlandı",
    color: "bg-green-100 text-green-600 dark:bg-green-900/30",
  },
};

export default function TaskDetailModal({
  task,
  organizationId,
  members,
  onClose,
  onUpdated,
  onDeleted,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [category, setCategory] = useState<TaskCategory | "">(
    task.category || ""
  );
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [assignedTo, setAssignedTo] = useState(task.assigned_to || "");
  const [dueDate, setDueDate] = useState(task.due_date?.split("T")[0] || "");
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Tarih formatla
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Gecikme kontrolü
  const isOverdue = () => {
    if (!task.due_date || task.status === "done") return false;
    const dueDate = new Date(task.due_date);
    dueDate.setHours(23, 59, 59, 999);
    return dueDate < new Date();
  };

  // Kaydet
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Başlık gerekli");
      return;
    }

    setLoading(true);

    try {
      const result = await updateOrganizationTask(task.id, organizationId, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        category: category || null,
        status,
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
      });

      if (result.success) {
        toast.success("Görev güncellendi!");
        onUpdated();
      } else {
        toast.error(result.error || "Güncelleme başarısız");
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Sil
  const handleDelete = async () => {
    setLoading(true);

    try {
      const result = await deleteOrganizationTask(task.id, organizationId);

      if (result.success) {
        toast.success("Görev silindi!");
        onDeleted();
      } else {
        toast.error(result.error || "Silme başarısız");
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Hızlı atama
  const handleQuickAssign = async (userId: string) => {
    try {
      await assignOrganizationTask(task.id, organizationId, userId || null);
      toast.success("Atama güncellendi!");
      onUpdated();
    } catch {
      toast.error("Atama başarısız");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {task.category && <CategoryBadge category={task.category} />}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                STATUS_CONFIG[task.status].color
              }`}
            >
              {STATUS_CONFIG[task.status].label}
            </span>
            {isOverdue() && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30">
                Gecikmiş
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Düzenle"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Sil"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isEditing ? (
            // Düzenleme modu
            <div className="space-y-4">
              {/* Başlık */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as TaskCategory)
                    }
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <option value="">Seçiniz</option>
                    {Object.entries(TASK_CATEGORIES).map(
                      ([key, { label, icon }]) => (
                        <option key={key} value={key}>
                          {icon} {label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Öncelik */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Öncelik
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as TaskPriority)
                    }
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <option value="low">🟢 Düşük</option>
                    <option value="medium">🟡 Orta</option>
                    <option value="high">🟠 Yüksek</option>
                    <option value="critical">🔴 Kritik</option>
                  </select>
                </div>

                {/* Durum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Durum
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <option value="todo">Yapılacak</option>
                    <option value="in_progress">Devam Ediyor</option>
                    <option value="done">Tamamlandı</option>
                  </select>
                </div>

                {/* Bitiş tarihi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                  />
                </div>
              </div>

              {/* Atanan kişi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Atanan Kişi
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <option value="">Atanmamış</option>
                  {members.map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.profiles?.full_name || member.profiles?.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Butonlar */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || !title.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center gap-2"
                >
                  {loading && (
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  Kaydet
                </button>
              </div>
            </div>
          ) : (
            // Görüntüleme modu
            <div className="space-y-6">
              {/* Başlık */}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {task.title}
              </h2>

              {/* Açıklama */}
              {task.description && (
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {task.description}
                </p>
              )}

              {/* Detaylar grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Öncelik */}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Öncelik
                  </p>
                  <p
                    className={`font-medium ${
                      PRIORITY_CONFIG[task.priority].color
                    }`}
                  >
                    {PRIORITY_CONFIG[task.priority].icon}{" "}
                    {PRIORITY_CONFIG[task.priority].label}
                  </p>
                </div>

                {/* Bitiş tarihi */}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Bitiş Tarihi
                  </p>
                  <p
                    className={`font-medium ${
                      isOverdue()
                        ? "text-red-500"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {formatDate(task.due_date)}
                  </p>
                </div>

                {/* Oluşturulma tarihi */}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Oluşturulma Tarihi
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(task.created_at)}
                  </p>
                </div>
              </div>

              {/* Atanan kişi */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Atanan Kişi
                </p>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => (
                    <button
                      key={member.user_id}
                      onClick={() => handleQuickAssign(member.user_id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        task.assigned_to === member.user_id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                        {(
                          member.profiles?.full_name?.[0] ||
                          member.profiles?.email?.[0] ||
                          "?"
                        ).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {member.profiles?.full_name || member.profiles?.email}
                      </span>
                      {task.assigned_to === member.user_id && (
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                  {task.assigned_to && (
                    <button
                      onClick={() => handleQuickAssign("")}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors"
                    >
                      Atamayı Kaldır
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Silme onay modalı */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Görevi Sil
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                &quot;{task.title}&quot; görevini silmek istediğinizden emin
                misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors"
                >
                  {loading ? "Siliniyor..." : "Sil"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
