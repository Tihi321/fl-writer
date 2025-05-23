"use client";

import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import WritingInterface from "@/components/WritingInterface";
import CharacterManager from "@/components/CharacterManager";
import Settings from "@/components/Settings";
import { Project } from "@/types";

export default function Home() {
  const [activeView, setActiveView] = useState<"dashboard" | "writing" | "characters" | "settings">(
    "dashboard"
  );
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <Dashboard
            onProjectSelect={(project) => {
              setActiveProject(project);
              setActiveView("writing");
            }}
            onNewProject={() => setActiveView("writing")}
          />
        );
      case "writing":
        return (
          <WritingInterface project={activeProject} onBack={() => setActiveView("dashboard")} />
        );
      case "characters":
        return (
          <CharacterManager project={activeProject} onBack={() => setActiveView("dashboard")} />
        );
      case "settings":
        return <Settings onBack={() => setActiveView("dashboard")} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FL Writer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveView("dashboard")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === "dashboard"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView("writing")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === "writing"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Write
              </button>
              <button
                onClick={() => setActiveView("characters")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === "characters"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Characters
              </button>
              <button
                onClick={() => setActiveView("settings")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === "settings"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{renderActiveView()}</main>
    </div>
  );
}
