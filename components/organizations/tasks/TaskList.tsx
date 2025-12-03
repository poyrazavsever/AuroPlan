"use client";

import type { TaskWithAssignee } from "@/types/supabase";
import { CategoryBadge } from "./TaskCategoryFilter";
import { updateOrganizationTaskStatus } from "@/app/(dashboard)/dashboard/organizations/[id]/tasks/actions";

type TaskStatus = "todo" | "in_progress" | "done";

interface Props {
  tasks: TaskWithAssignee[];
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
  onTaskClick: (task: TaskWithAssignee) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const PRIORITY_CONFIG = {
  critical: {
    label: "Kritik",
    color: "text-red-600 bg-red-100 dark:bg-red-900/30",
  },
  high: {
    label: "Yüksek",
    color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  },
  medium: {
    label: "Orta",
    color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
  },
  low: {
    label: "Düşük",
    color: "text-green-600 bg-green-100 dark:bg-green-900/30",
  },
};

const STATUS_CONFIG = {
  todo: {
    label: "Yapılacak",
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  },
  in_progress: {
    label: "Devam Ediyor",
    color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  },
  done: {
    label: "Tamamlandı",
    color: "text-green-600 bg-green-100 dark:bg-green-900/30",
  },
};

export default function TaskList({
  tasks,
  organizationId,
  members,
  onTaskClick,
  onStatusChange,
}: Props) {
  // Tarih formatla
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Gecikme kontrolü
  const isOverdue = (dateStr: string | null, status: string) => {
    if (!dateStr || status === "done") return false;
    const dueDate = new Date(dateStr);
    dueDate.setHours(23, 59, 59, 999);
    return dueDate < new Date();
  };

  // Durum değiştir
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    onStatusChange(taskId, newStatus);
    await updateOrganizationTaskStatus(taskId, organizationId, newStatus);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Tablo başlığı */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
        <div className="col-span-4">Görev</div>
        <div className="col-span-2">Kategori</div>
        <div className="col-span-1">Öncelik</div>
        <div className="col-span-2">Durum</div>
        <div className="col-span-1">Tarih</div>
        <div className="col-span-2">Atanan</div>
      </div>

      {/* Görev satırları */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
          >
            <div className="md:hidden space-y-2">
              {/* Mobil görünüm */}
              <div onClick={() => onTaskClick(task)}>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                    {task.description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {task.category && (
                  <CategoryBadge category={task.category} size="sm" />
                )}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    PRIORITY_CONFIG[task.priority].color
                  }`}
                >
                  {PRIORITY_CONFIG[task.priority].label}
                </span>
                <select
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(task.id, e.target.value as TaskStatus)
                  }
                  onClick={(e) => e.stopPropagation()}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 ${
                    STATUS_CONFIG[task.status].color
                  }`}
                >
                  <option value="todo">Yapılacak</option>
                  <option value="in_progress">Devam Ediyor</option>
                  <option value="done">Tamamlandı</option>
                </select>
                {task.due_date && (
                  <span
                    className={`text-xs ${
                      isOverdue(task.due_date, task.status)
                        ? "text-red-500 font-medium"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {formatDate(task.due_date)}
                  </span>
                )}
              </div>
            </div>

            {/* Desktop görünüm */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
              {/* Görev */}
              <div className="col-span-4" onClick={() => onTaskClick(task)}>
                <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Kategori */}
              <div className="col-span-2">
                {task.category ? (
                  <CategoryBadge category={task.category} size="sm" />
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </div>

              {/* Öncelik */}
              <div className="col-span-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    PRIORITY_CONFIG[task.priority].color
                  }`}
                >
                  {PRIORITY_CONFIG[task.priority].label}
                </span>
              </div>

              {/* Durum */}
              <div className="col-span-2">
                <select
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(task.id, e.target.value as TaskStatus)
                  }
                  onClick={(e) => e.stopPropagation()}
                  className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${
                    STATUS_CONFIG[task.status].color
                  }`}
                >
                  <option value="todo">Yapılacak</option>
                  <option value="in_progress">Devam Ediyor</option>
                  <option value="done">Tamamlandı</option>
                </select>
              </div>

              {/* Tarih */}
              <div className="col-span-1">
                <span
                  className={`text-sm ${
                    isOverdue(task.due_date, task.status)
                      ? "text-red-500 font-medium"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {formatDate(task.due_date)}
                </span>
              </div>

              {/* Atanan */}
              <div className="col-span-2">
                {task.profiles ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium shrink-0">
                      {(
                        task.profiles.full_name?.[0] ||
                        task.profiles.email?.[0] ||
                        "?"
                      ).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {task.profiles.full_name || task.profiles.email}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Atanmamış</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
