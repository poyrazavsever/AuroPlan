"use client";

import { useState } from "react";
import type { TaskWithAssignee } from "@/types/supabase";
import { CategoryBadge } from "./TaskCategoryFilter";
import { updateOrganizationTaskStatus } from "@/app/(dashboard)/dashboard/organizations/[id]/tasks/actions";

type TaskStatus = "todo" | "in_progress" | "done";

interface Props {
  tasks: TaskWithAssignee[];
  organizationId: string;
  onTaskClick: (task: TaskWithAssignee) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "Yapılacak", color: "bg-blue-500" },
  { id: "in_progress", label: "Devam Ediyor", color: "bg-amber-500" },
  { id: "done", label: "Tamamlandı", color: "bg-green-500" },
];

const PRIORITY_COLORS = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-yellow-500",
  low: "border-l-green-500",
};

const PRIORITY_ICONS = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🟢",
};

export default function TaskKanban({
  tasks,
  organizationId,
  onTaskClick,
  onStatusChange,
}: Props) {
  const [draggedTask, setDraggedTask] = useState<TaskWithAssignee | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Sütuna göre görevleri grupla
  const tasksByStatus = COLUMNS.reduce((acc, column) => {
    acc[column.id] = tasks.filter((task) => task.status === column.id);
    return acc;
  }, {} as Record<TaskStatus, TaskWithAssignee[]>);

  // Sürükleme başladı
  const handleDragStart = (task: TaskWithAssignee) => {
    setDraggedTask(task);
  };

  // Sürükleme bitti
  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Sütun üzerine bırakıldı
  const handleDrop = async (status: TaskStatus) => {
    if (!draggedTask || draggedTask.status === status) return;

    // Optimistic update
    onStatusChange(draggedTask.id, status);

    // Server update
    await updateOrganizationTaskStatus(draggedTask.id, organizationId, status);

    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Tarih formatla
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0)
      return { text: `${Math.abs(diffDays)} gün gecikti`, isOverdue: true };
    if (diffDays === 0) return { text: "Bugün", isToday: true };
    if (diffDays === 1) return { text: "Yarın", isSoon: true };
    if (diffDays <= 7) return { text: `${diffDays} gün`, isSoon: true };
    return {
      text: date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
      }),
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((column) => (
        <div
          key={column.id}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverColumn(column.id);
          }}
          onDragLeave={() => setDragOverColumn(null)}
          onDrop={() => handleDrop(column.id)}
          className={`bg-gray-50 dark:bg-gray-900 rounded-xl p-4 min-h-[400px] transition-colors ${
            dragOverColumn === column.id
              ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : ""
          }`}
        >
          {/* Sütun başlığı */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 ${column.color} rounded-full`} />
              <h3 className="font-medium text-gray-900 dark:text-white">
                {column.label}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({tasksByStatus[column.id].length})
              </span>
            </div>
          </div>

          {/* Görev kartları */}
          <div className="space-y-3">
            {tasksByStatus[column.id].map((task) => {
              const dueDateInfo = formatDate(task.due_date);

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onTaskClick(task)}
                  className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:shadow-md transition-all border-l-4 ${
                    PRIORITY_COLORS[task.priority]
                  } ${
                    draggedTask?.id === task.id ? "opacity-50 scale-95" : ""
                  }`}
                >
                  {/* Kategori */}
                  {task.category && (
                    <div className="mb-2">
                      <CategoryBadge category={task.category} size="sm" />
                    </div>
                  )}

                  {/* Başlık */}
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                    {task.title}
                  </h4>

                  {/* Açıklama */}
                  {task.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                      {task.description}
                    </p>
                  )}

                  {/* Alt bilgiler */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {/* Öncelik */}
                    <span
                      className="text-xs"
                      title={`${task.priority} öncelik`}
                    >
                      {PRIORITY_ICONS[task.priority]}
                    </span>

                    {/* Tarih */}
                    {dueDateInfo && (
                      <span
                        className={`text-xs ${
                          dueDateInfo.isOverdue
                            ? "text-red-500 font-medium"
                            : dueDateInfo.isToday
                            ? "text-amber-500 font-medium"
                            : dueDateInfo.isSoon
                            ? "text-blue-500"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {dueDateInfo.text}
                      </span>
                    )}

                    {/* Atanan kişi */}
                    {task.profiles ? (
                      <div
                        className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium"
                        title={
                          task.profiles.full_name || task.profiles.email || ""
                        }
                      >
                        {(
                          task.profiles.full_name?.[0] ||
                          task.profiles.email?.[0] ||
                          "?"
                        ).toUpperCase()}
                      </div>
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                        title="Atanmamış"
                      >
                        <svg
                          className="w-3 h-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Boş sütun */}
            {tasksByStatus[column.id].length === 0 && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                {dragOverColumn === column.id ? "Buraya bırakın" : "Görev yok"}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
