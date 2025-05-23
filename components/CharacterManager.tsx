"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, User, Edit3, Trash2, Save } from "lucide-react";
import { Project, Character } from "@/types";
import toast from "react-hot-toast";

interface CharacterManagerProps {
  project: Project | null;
  onBack: () => void;
}

export default function CharacterManager({ project, onBack }: CharacterManagerProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (project) {
      setCharacters(project.characters || []);
    }
  }, [project]);

  const handleSaveCharacter = (characterData: Partial<Character>) => {
    if (!project) return;

    let updatedCharacters: Character[];

    if (isEditing && selectedCharacter) {
      const updatedCharacter = { ...selectedCharacter, ...characterData };
      updatedCharacters = characters.map((c) =>
        c.id === selectedCharacter.id ? updatedCharacter : c
      );
      setSelectedCharacter(updatedCharacter);
    } else {
      const newCharacter: Character = {
        id: Date.now().toString(),
        name: characterData.name || "Unnamed Character",
        description: characterData.description || "",
        role: characterData.role || "supporting",
        appearance: characterData.appearance || "",
        personality: characterData.personality || "",
        background: characterData.background || "",
        goals: characterData.goals || "",
        conflicts: characterData.conflicts || "",
        relationships: characterData.relationships || "",
        notes: characterData.notes || "",
      };
      updatedCharacters = [...characters, newCharacter];
      setSelectedCharacter(newCharacter);
    }

    setCharacters(updatedCharacters);

    // Update the project in localStorage
    const savedProjects = localStorage.getItem("fl-writer-projects");
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      const projectIndex = projects.findIndex((p: Project) => p.id === project.id);

      if (projectIndex !== -1) {
        projects[projectIndex].characters = updatedCharacters;
        projects[projectIndex].updatedAt = new Date();
        localStorage.setItem("fl-writer-projects", JSON.stringify(projects));
        toast.success("Character saved successfully!");
      }
    }

    setShowForm(false);
    setIsEditing(false);
  };

  const handleDeleteCharacter = (characterId: string) => {
    if (!project) return;

    const updatedCharacters = characters.filter((c) => c.id !== characterId);
    setCharacters(updatedCharacters);

    if (selectedCharacter?.id === characterId) {
      setSelectedCharacter(null);
    }

    // Update localStorage
    const savedProjects = localStorage.getItem("fl-writer-projects");
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      const projectIndex = projects.findIndex((p: Project) => p.id === project.id);

      if (projectIndex !== -1) {
        projects[projectIndex].characters = updatedCharacters;
        projects[projectIndex].updatedAt = new Date();
        localStorage.setItem("fl-writer-projects", JSON.stringify(projects));
        toast.success("Character deleted successfully!");
      }
    }
  };

  const getRoleColor = (role: Character["role"]) => {
    switch (role) {
      case "protagonist":
        return "bg-blue-100 text-blue-800";
      case "antagonist":
        return "bg-red-100 text-red-800";
      case "supporting":
        return "bg-green-100 text-green-800";
      case "minor":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!project) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No project selected
        </h3>
        <p className="mt-1 text-sm text-gray-500">Please select a project to manage characters.</p>
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
      {/* Character List */}
      <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Characters</h2>
            <button
              onClick={() => {
                setSelectedCharacter(null);
                setIsEditing(false);
                setShowForm(true);
              }}
              className="p-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-500">{project.title}</p>
        </div>

        <div className="overflow-y-auto">
          {characters.length === 0 ? (
            <div className="p-4 text-center">
              <User className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No characters yet</p>
              <button
                onClick={() => {
                  setSelectedCharacter(null);
                  setIsEditing(false);
                  setShowForm(true);
                }}
                className="mt-2 text-sm text-primary hover:text-primary-dark"
              >
                Create your first character
              </button>
            </div>
          ) : (
            characters.map((character) => (
              <div
                key={character.id}
                onClick={() => setSelectedCharacter(character)}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedCharacter?.id === character.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{character.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getRoleColor(character.role)}`}
                  >
                    {character.role}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {character.description || "No description available"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Character Details */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-800">
        {selectedCharacter ? (
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCharacter.name}
                  </h1>
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full ${getRoleColor(
                      selectedCharacter.role
                    )}`}
                  >
                    {selectedCharacter.role}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowForm(true);
                    }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <Edit3 size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCharacter(selectedCharacter.id)}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CharacterSection title="Description" content={selectedCharacter.description} />
                <CharacterSection title="Appearance" content={selectedCharacter.appearance} />
                <CharacterSection title="Personality" content={selectedCharacter.personality} />
                <CharacterSection title="Background" content={selectedCharacter.background} />
                <CharacterSection title="Goals" content={selectedCharacter.goals} />
                <CharacterSection title="Conflicts" content={selectedCharacter.conflicts} />
                <CharacterSection title="Relationships" content={selectedCharacter.relationships} />
                <CharacterSection title="Notes" content={selectedCharacter.notes} />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a character
              </h3>
              <p className="text-gray-500">
                Choose a character from the list to view their details
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Character Form Modal */}
      {showForm && (
        <CharacterForm
          character={isEditing ? selectedCharacter : null}
          onClose={() => {
            setShowForm(false);
            setIsEditing(false);
          }}
          onSave={handleSaveCharacter}
        />
      )}
    </div>
  );
}

interface CharacterSectionProps {
  title: string;
  content: string;
}

function CharacterSection({ title, content }: CharacterSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        {content || `No ${title.toLowerCase()} provided`}
      </p>
    </div>
  );
}

interface CharacterFormProps {
  character: Character | null;
  onClose: () => void;
  onSave: (data: Partial<Character>) => void;
}

function CharacterForm({ character, onClose, onSave }: CharacterFormProps) {
  const [formData, setFormData] = useState({
    name: character?.name || "",
    description: character?.description || "",
    role: character?.role || ("supporting" as Character["role"]),
    appearance: character?.appearance || "",
    personality: character?.personality || "",
    background: character?.background || "",
    goals: character?.goals || "",
    conflicts: character?.conflicts || "",
    relationships: character?.relationships || "",
    notes: character?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {character ? "Edit Character" : "Create New Character"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as Character["role"] })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="protagonist">Protagonist</option>
                <option value="antagonist">Antagonist</option>
                <option value="supporting">Supporting</option>
                <option value="minor">Minor</option>
              </select>
            </div>
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
              placeholder="Brief description of the character..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Appearance
            </label>
            <textarea
              value={formData.appearance}
              onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Physical description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Personality
            </label>
            <textarea
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Personality traits, quirks, habits..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Background
            </label>
            <textarea
              value={formData.background}
              onChange={(e) => setFormData({ ...formData, background: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Character's history, upbringing, key events..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Goals
              </label>
              <textarea
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="What does this character want?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Conflicts
              </label>
              <textarea
                value={formData.conflicts}
                onChange={(e) => setFormData({ ...formData, conflicts: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Internal and external conflicts..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Relationships
            </label>
            <textarea
              value={formData.relationships}
              onChange={(e) => setFormData({ ...formData, relationships: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Relationships with other characters..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Additional notes, ideas, or reminders..."
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
              {character ? "Update Character" : "Create Character"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
