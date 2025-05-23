"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen, Calendar, Target, TrendingUp } from "lucide-react";
import { Project } from "@/types";
import { format } from "date-fns";

interface DashboardProps {
  onProjectSelect: (project: Project) => void;
  onNewProject: () => void;
}

export default function Dashboard({ onProjectSelect, onNewProject }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);

  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem("fl-writer-projects");
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
      setProjects(parsedProjects);
    }
  }, []);

  const handleCreateProject = (projectData: Partial<Project>) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: projectData.title || "Untitled Project",
      description: projectData.description || "",
      genre: projectData.genre || "Fiction",
      wordCount: 0,
      targetWordCount: projectData.targetWordCount || 50000,
      status: "planning",
      createdAt: new Date(),
      updatedAt: new Date(),
      chapters: [],
      characters: [],
      settings: [],
      plotPoints: [],
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem("fl-writer-projects", JSON.stringify(updatedProjects));
    setShowNewProjectForm(false);
    onProjectSelect(newProject);
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "planning":
        return "bg-yellow-100 text-yellow-800";
      case "writing":
        return "bg-blue-100 text-blue-800";
      case "editing":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Writing Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your fiction projects and track your progress
          </p>
        </div>
        <button
          onClick={() => setShowNewProjectForm(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>New Project</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
            </div>
            <BookOpen className="text-primary" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Words</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {projects.reduce((total, project) => total + project.wordCount, 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {projects.filter((p) => p.status === "writing").length}
              </p>
            </div>
            <Calendar className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {projects.filter((p) => p.status === "completed").length}
              </p>
            </div>
            <Target className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onProjectSelect(project)}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {project.title}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {project.description || "No description available"}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {project.wordCount} / {project.targetWordCount} words
                </span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((project.wordCount / project.targetWordCount) * 100, 100)}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Genre: {project.genre}</span>
                <span>Updated {format(project.updatedAt, "MMM d")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No projects yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first writing project.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowNewProjectForm(true)}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
            >
              <Plus size={20} />
              <span>Create Project</span>
            </button>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectForm && (
        <NewProjectModal
          onClose={() => setShowNewProjectForm(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
}

interface NewProjectModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<Project>) => void;
}

function NewProjectModal({ onClose, onSubmit }: NewProjectModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "Fiction",
    targetWordCount: 50000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create New Project
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Genre
            </label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="Fiction">Fiction</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Mystery">Mystery</option>
              <option value="Romance">Romance</option>
              <option value="Thriller">Thriller</option>
              <option value="Horror">Horror</option>
              <option value="Literary Fiction">Literary Fiction</option>
              <option value="Young Adult">Young Adult</option>
              <option value="Children's">Children's</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Word Count
            </label>
            <input
              type="number"
              value={formData.targetWordCount}
              onChange={(e) =>
                setFormData({ ...formData, targetWordCount: parseInt(e.target.value) || 50000 })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              min="1000"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
