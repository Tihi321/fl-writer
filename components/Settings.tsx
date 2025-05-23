"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Moon, Sun, Type, Zap } from "lucide-react";
import { AppSettings } from "@/types";
import toast from "react-hot-toast";

interface SettingsProps {
  onBack: () => void;
}

const defaultSettings: AppSettings = {
  theme: "auto",
  fontSize: 16,
  fontFamily: "Georgia",
  autoSave: true,
  autoSaveInterval: 30,
  aiProvider: "openai",
  aiModel: "gpt-3.5-turbo",
  aiTemperature: 0.7,
  aiMaxTokens: 150,
  showWordCount: true,
  showReadingTime: true,
  targetDailyWords: 500,
};

export default function Settings({ onBack }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem("fl-writer-settings");
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("fl-writer-settings", JSON.stringify(settings));
    toast.success("Settings saved successfully!");
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Customize your writing environment and AI preferences
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Save size={20} />
          <span>Save Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Sun className="text-yellow-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => updateSetting("theme", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="24"
                value={settings.fontSize}
                onChange={(e) => updateSetting("fontSize", parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Family
              </label>
              <select
                value={settings.fontFamily}
                onChange={(e) => updateSetting("fontFamily", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="Georgia">Georgia (Serif)</option>
                <option value="Times New Roman">Times New Roman (Serif)</option>
                <option value="Arial">Arial (Sans-serif)</option>
                <option value="Helvetica">Helvetica (Sans-serif)</option>
                <option value="Courier New">Courier New (Monospace)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Writing Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Type className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Writing</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto Save
                </label>
                <p className="text-xs text-gray-500">Automatically save your work</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => updateSetting("autoSave", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auto Save Interval: {settings.autoSaveInterval} seconds
              </label>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={settings.autoSaveInterval}
                onChange={(e) => updateSetting("autoSaveInterval", parseInt(e.target.value))}
                disabled={!settings.autoSave}
                className="w-full disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Word Count
                </label>
                <p className="text-xs text-gray-500">Display word count in the editor</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showWordCount}
                  onChange={(e) => updateSetting("showWordCount", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Reading Time
                </label>
                <p className="text-xs text-gray-500">Estimate reading time</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showReadingTime}
                  onChange={(e) => updateSetting("showReadingTime", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Daily Word Target: {settings.targetDailyWords} words
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={settings.targetDailyWords}
                onChange={(e) => updateSetting("targetDailyWords", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="text-purple-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Provider
                </label>
                <select
                  value={settings.aiProvider}
                  onChange={(e) => updateSetting("aiProvider", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="local">Local Model</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Model
                </label>
                <select
                  value={settings.aiModel}
                  onChange={(e) => updateSetting("aiModel", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                >
                  {settings.aiProvider === "openai" && (
                    <>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </>
                  )}
                  {settings.aiProvider === "anthropic" && (
                    <>
                      <option value="claude-3-haiku">Claude 3 Haiku</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                    </>
                  )}
                  {settings.aiProvider === "local" && (
                    <option value="local-model">Local Model</option>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Creativity (Temperature): {settings.aiTemperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.aiTemperature}
                  onChange={(e) => updateSetting("aiTemperature", parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Conservative</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Response Length: {settings.aiMaxTokens} tokens
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="25"
                  value={settings.aiMaxTokens}
                  onChange={(e) => updateSetting("aiMaxTokens", parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> To use AI features, you'll need to configure your API keys in a
              .env.local file. See the documentation for setup instructions.
            </p>
          </div>
        </div>
      </div>

      {/* Export/Import Settings */}
      <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Backup & Restore
        </h3>

        <div className="flex space-x-4">
          <button
            onClick={() => {
              const data = {
                settings,
                projects: JSON.parse(localStorage.getItem("fl-writer-projects") || "[]"),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `fl-writer-backup-${new Date().toISOString().split("T")[0]}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              toast.success("Backup created successfully!");
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Export Backup
          </button>

          <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
            Import Backup
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const data = JSON.parse(event.target?.result as string);
                      if (data.settings) {
                        setSettings(data.settings);
                        localStorage.setItem("fl-writer-settings", JSON.stringify(data.settings));
                      }
                      if (data.projects) {
                        localStorage.setItem("fl-writer-projects", JSON.stringify(data.projects));
                      }
                      toast.success("Backup restored successfully!");
                    } catch (error) {
                      toast.error("Invalid backup file");
                    }
                  };
                  reader.readAsText(file);
                }
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
