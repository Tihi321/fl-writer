"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Save,
  Download,
  Lightbulb,
  RefreshCw,
  Type,
  BarChart3,
  BookOpen,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import { Project, Chapter, AiSuggestion } from "@/types";
import toast from "react-hot-toast";

interface WritingInterfaceProps {
  project: Project | null;
  onBack: () => void;
}

export default function WritingInterface({ project, onBack }: WritingInterfaceProps) {
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [content, setContent] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [selectedText, setSelectedText] = useState("");
  const [copiedText, setCopiedText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (project && project.chapters.length > 0) {
      setCurrentChapter(project.chapters[0]);
      setContent(project.chapters[0].content);
    } else if (project) {
      // Create a default chapter if none exists
      const newChapter: Chapter = {
        id: Date.now().toString(),
        title: "Chapter 1",
        content: "",
        wordCount: 0,
        order: 1,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCurrentChapter(newChapter);
      setContent("");
    }
  }, [project]);

  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  const handleSave = () => {
    if (!project || !currentChapter) return;

    const updatedChapter = {
      ...currentChapter,
      content,
      wordCount,
      updatedAt: new Date(),
    };

    // Update the project in localStorage
    const savedProjects = localStorage.getItem("fl-writer-projects");
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      const projectIndex = projects.findIndex((p: Project) => p.id === project.id);

      if (projectIndex !== -1) {
        const chapterIndex = projects[projectIndex].chapters.findIndex(
          (c: Chapter) => c.id === currentChapter.id
        );

        if (chapterIndex !== -1) {
          projects[projectIndex].chapters[chapterIndex] = updatedChapter;
        } else {
          projects[projectIndex].chapters.push(updatedChapter);
        }

        // Update project word count
        projects[projectIndex].wordCount = projects[projectIndex].chapters.reduce(
          (total: number, chapter: Chapter) => total + chapter.wordCount,
          0
        );
        projects[projectIndex].updatedAt = new Date();

        localStorage.setItem("fl-writer-projects", JSON.stringify(projects));
        toast.success("Content saved successfully!");
      }
    }
  };

  const generateAiSuggestion = async () => {
    if (!content.trim()) {
      toast.error("Please write some content first to get AI suggestions");
      return;
    }

    setIsGeneratingSuggestion(true);
    try {
      // Simulate AI suggestion generation (in a real app, you'd call an AI API)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const suggestions = [
        {
          id: Date.now().toString(),
          type: "continuation" as const,
          content: `Here's a suggested continuation: ${generateRandomSuggestion()}`,
          context: content.slice(-100),
          confidence: 0.85,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          type: "improvement" as const,
          content: `Consider this improvement: ${generateRandomImprovement()}`,
          context: content.slice(-100),
          confidence: 0.78,
          timestamp: new Date(),
        },
      ];

      setAiSuggestions(suggestions);
      setShowAiPanel(true);
      toast.success("AI suggestions generated!");
    } catch (error) {
      toast.error("Failed to generate AI suggestions");
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  const generateRandomSuggestion = () => {
    const suggestions = [
      "The shadows deepened as evening approached, casting long fingers across the room.",
      "She paused at the threshold, her hand trembling on the door handle.",
      "The sound of footsteps echoed through the empty hallway, growing closer with each passing moment.",
      "A gentle breeze stirred the curtains, carrying with it the scent of rain and distant memories.",
      "The old photograph fell to the floor, its edges yellowed with time and secrets.",
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const generateRandomImprovement = () => {
    const improvements = [
      "Try using more sensory details to immerse the reader in the scene.",
      "Consider varying your sentence structure for better flow.",
      "This would be a great place to add some dialogue to break up the narrative.",
      "You could strengthen this passage with more specific, concrete imagery.",
      "Think about adding internal conflict or tension to this moment.",
    ];
    return improvements[Math.floor(Math.random() * improvements.length)];
  };

  const applySuggestion = (suggestion: AiSuggestion) => {
    if (suggestion.type === "continuation") {
      setContent((prev) => prev + "\n\n" + suggestion.content);
    } else {
      // For improvements, just copy to clipboard
      navigator.clipboard.writeText(suggestion.content);
      setCopiedText(suggestion.id);
      setTimeout(() => setCopiedText(""), 2000);
      toast.success("Suggestion copied to clipboard!");
    }
  };

  const getSelectedText = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end);
      setSelectedText(selected);
      return selected;
    }
    return "";
  };

  const handleExport = () => {
    if (!project || !content) return;

    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${project.title} - ${currentChapter?.title || "Chapter"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Content exported successfully!");
  };

  if (!project) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No project selected
        </h3>
        <p className="mt-1 text-sm text-gray-500">Please select a project to start writing.</p>
        <button
          onClick={onBack}
          className="mt-4 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Main Writing Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {project.title}
              </h1>
              <p className="text-sm text-gray-500">{currentChapter?.title || "New Chapter"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              {wordCount} words
            </div>
            <button
              onClick={generateAiSuggestion}
              disabled={isGeneratingSuggestion}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isGeneratingSuggestion ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Lightbulb size={16} />
              )}
              <span>{isGeneratingSuggestion ? "Generating..." : "AI Assist"}</span>
            </button>
            <button
              onClick={() => setShowAiPanel(!showAiPanel)}
              className={`p-2 rounded-lg transition-colors ${
                showAiPanel ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Zap size={20} />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Writing Area */}
        <div className="flex-1 p-6">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onMouseUp={getSelectedText}
            onKeyUp={getSelectedText}
            placeholder="Start writing your story here..."
            className="w-full h-full resize-none border-none outline-none text-gray-900 dark:text-white bg-transparent text-lg leading-relaxed"
            style={{ fontFamily: "Georgia, serif" }}
          />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Characters: {content.length}</span>
            <span>Words: {wordCount}</span>
            <span>Reading time: ~{Math.ceil(wordCount / 200)} min</span>
          </div>
          <div className="flex items-center space-x-4">
            {selectedText && <span>Selected: {selectedText.length} characters</span>}
            <span>Auto-saved</span>
          </div>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {showAiPanel && (
        <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Suggestions</h3>
            <button
              onClick={() => setShowAiPanel(false)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {aiSuggestions.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Click "AI Assist" to generate suggestions for your writing
                </p>
              </div>
            ) : (
              aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        suggestion.type === "continuation"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {suggestion.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {suggestion.content}
                  </p>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => applySuggestion(suggestion)}
                      className="flex-1 bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      {suggestion.type === "continuation" ? "Apply" : "Copy"}
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(suggestion.content)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      {copiedText === suggestion.id ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
