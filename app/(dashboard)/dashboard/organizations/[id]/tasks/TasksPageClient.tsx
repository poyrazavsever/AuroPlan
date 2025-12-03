"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TaskWithAssignee, TaskCategory } from "@/types/supabase";
import TaskStats from "@/components/organizations/tasks/TaskStats";
import TaskCategoryFilter from "@/components/organizations/tasks/TaskCategoryFilter";
import TaskKanban from "@/components/organizations/tasks/TaskKanban";
import TaskList from "@/components/organizations/tasks/TaskList";
import NewOrgTaskModal from "@/components/organizations/tasks/NewOrgTaskModal";
import TaskDetailModal from "@/components/organizations/tasks/TaskDetailModal";

type ViewMode = "kanban" | "list";
type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high" | "critical";

interface Props {
  organization: {
    id: string;
    name: string;
    slug: string;
    type: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
  };
  initialTasks: TaskWithAssignee[];
  initialStats: {
    total: number;
    todo: number;
    in_progress: number;
    done: number;
    byCategory: Record<string, number>;
    overdue: number;
    dueToday: number;
    dueSoon: number;
  };
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
}

export default function TasksPageClient({
  organization,
  initialTasks,
  initialStats,
  members,
}: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskWithAssignee[]>(initialTasks);
  const [stats, setStats] = useState(initialStats);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    TaskCategory | "all"
  >("all");
  const [selectedPriority, setSelectedPriority] = useState<
    TaskPriority | "all"
  >("all");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "all">(
    "all"
  );
  const [selectedAssignee, setSelectedAssignee] = useState<string | "all">(
    "all"
  );
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignee | null>(
    null
  );

  // Filtrelenmiş görevler
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Arama filtresi
      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Kategori filtresi
      if (selectedCategory !== "all" && task.category !== selectedCategory) {
        return false;
      }

      // Öncelik filtresi
      if (selectedPriority !== "all" && task.priority !== selectedPriority) {
        return false;
      }

      // Durum filtresi
      if (selectedStatus !== "all" && task.status !== selectedStatus) {
        return false;
      }

      // Atanan kişi filtresi
      if (selectedAssignee !== "all" && task.assigned_to !== selectedAssignee) {
        return false;
      }

      return true;
    });
  }, [
    tasks,
    searchQuery,
    selectedCategory,
    selectedPriority,
    selectedStatus,
    selectedAssignee,
  ]);

  // Görev eklendikten sonra yenile
  const handleTaskCreated = () => {
    router.refresh();
    setShowNewTaskModal(false);
  };

  // Görev durumu değişti
  const handleTaskStatusChanged = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    router.refresh();
  };

  // Görev güncellendi
  const handleTaskUpdated = () => {
    router.refresh();
    setSelectedTask(null);
  };

  // Görev silindi
  const handleTaskDeleted = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
    router.refresh();
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedPriority("all");
    setSelectedStatus("all");
    setSelectedAssignee("all");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    selectedPriority !== "all" ||
    selectedStatus !== "all" ||
    selectedAssignee !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Link
              href="/dashboard/organizations"
              className="hover:text-gray-700 dark:hover:text-gray-200"
            >
              Organizasyonlar
            </Link>
            <span>/</span>
            <Link
              href={`/dashboard/organizations/${organization.id}`}
              className="hover:text-gray-700 dark:hover:text-gray-200"
            >
              {organization.name}
            </Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-200">Görevler</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Görev Yönetimi
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {stats.total} görev • {stats.done} tamamlandı •{" "}
            {stats.overdue > 0 && (
              <span className="text-red-500">{stats.overdue} gecikmiş</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Görünüm değiştirici */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Yeni görev butonu */}
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Yeni Görev
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <TaskStats stats={stats} />

      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Arama */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Görev ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtreler */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Kategori filtresi */}
            <TaskCategoryFilter
              selectedCategory={selectedCategory}
              onChange={setSelectedCategory}
              stats={stats.byCategory}
            />

            {/* Öncelik filtresi */}
            <select
              value={selectedPriority}
              onChange={(e) =>
                setSelectedPriority(e.target.value as TaskPriority | "all")
              }
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            >
              <option value="all">Tüm Öncelikler</option>
              <option value="critical">🔴 Kritik</option>
              <option value="high">🟠 Yüksek</option>
              <option value="medium">🟡 Orta</option>
              <option value="low">🟢 Düşük</option>
            </select>

            {/* Durum filtresi */}
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as TaskStatus | "all")
              }
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="todo">📋 Yapılacak</option>
              <option value="in_progress">🔄 Devam Ediyor</option>
              <option value="done">✅ Tamamlandı</option>
            </select>

            {/* Atanan kişi filtresi */}
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            >
              <option value="all">Tüm Kişiler</option>
              <option value="">Atanmamış</option>
              {members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.profiles?.full_name || member.profiles?.email}
                </option>
              ))}
            </select>

            {/* Filtreleri temizle */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* Aktif filtre sayısı */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredTasks.length} görev gösteriliyor
              {filteredTasks.length !== tasks.length && (
                <span> ({tasks.length} toplam)</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Görev listesi veya kanban */}
      {viewMode === "kanban" ? (
        <TaskKanban
          tasks={filteredTasks}
          organizationId={organization.id}
          onTaskClick={setSelectedTask}
          onStatusChange={handleTaskStatusChanged}
        />
      ) : (
        <TaskList
          tasks={filteredTasks}
          organizationId={organization.id}
          members={members}
          onTaskClick={setSelectedTask}
          onStatusChange={handleTaskStatusChanged}
        />
      )}

      {/* Boş durum */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            {hasActiveFilters ? "Görev bulunamadı" : "Henüz görev yok"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {hasActiveFilters
              ? "Filtreleri değiştirmeyi deneyin"
              : "Bu organizasyon için ilk görevi oluşturun"}
          </p>
          {!hasActiveFilters && (
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Yeni Görev Oluştur
            </button>
          )}
        </div>
      )}

      {/* Yeni görev modalı */}
      {showNewTaskModal && (
        <NewOrgTaskModal
          organizationId={organization.id}
          members={members}
          onClose={() => setShowNewTaskModal(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {/* Görev detay modalı */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          organizationId={organization.id}
          members={members}
          onClose={() => setSelectedTask(null)}
          onUpdated={handleTaskUpdated}
          onDeleted={() => handleTaskDeleted(selectedTask.id)}
        />
      )}
    </div>
  );
}
