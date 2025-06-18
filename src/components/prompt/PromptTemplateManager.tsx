"use client";

import React, { useState } from "react"; // Ensure React is imported for useState
import { PlusCircle, FilePenLine, Trash2, X, Check } from "lucide-react";

interface PromptTemplate {
  id: string;
  name: string;
  template: string;
}

interface PromptTemplateManagerProps {
  templates: PromptTemplate[];
  onAddTemplate: (template: Omit<PromptTemplate, "id">) => void;
  onUpdateTemplate: (template: PromptTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onSelectTemplate: (template: string) => void;
}

export function PromptTemplateManager({
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onSelectTemplate,
}: PromptTemplateManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", template: "" });
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null
  ); // Corrected useState usage

  const handleAddTemplate = () => {
    if (newTemplate.name.trim() && newTemplate.template.trim()) {
      onAddTemplate({
        name: newTemplate.name,
        template: newTemplate.template,
      });
      setNewTemplate({ name: "", template: "" });
      setIsAdding(false);
    }
  };

  const handleEditTemplate = (template: PromptTemplate) => {
    setEditingTemplateId(template.id);
    setNewTemplate({ name: template.name, template: template.template });
  };

  const handleUpdateTemplate = (id: string) => {
    if (newTemplate.name.trim() && newTemplate.template.trim()) {
      onUpdateTemplate({
        id: id,
        name: newTemplate.name,
        template: newTemplate.template,
      });
      setNewTemplate({ name: "", template: "" });
      setEditingTemplateId(null);
    }
  };

  const cancelEditOrAdd = () => {
    setIsAdding(false);
    setEditingTemplateId(null);
    setNewTemplate({ name: "", template: "" });
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Kelola Prompt Templates</h3>

      {templates.length === 0 && !isAdding && (
        <p className="text-slate-500">
          Belum ada template. Tambahkan sekarang!
        </p>
      )}

      {isAdding || editingTemplateId ? ( // Show form if adding or editing
        <div className="mb-4">
          <input
            type="text"
            placeholder="Nama Template"
            value={newTemplate.name}
            onChange={(e) =>
              setNewTemplate({ ...newTemplate, name: e.target.value })
            }
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            placeholder="Isi Template (gunakan {placeholders})"
            value={newTemplate.template}
            onChange={(e) =>
              setNewTemplate({ ...newTemplate, template: e.target.value })
            }
            className="w-full p-2 mb-2 border rounded"
          />
          {editingTemplateId ? (
            <button
              onClick={() => handleUpdateTemplate(editingTemplateId)}
              className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
            >
              <Check size={16} /> Update
            </button>
          ) : (
            <button
              onClick={handleAddTemplate}
              className="bg-green-500 text-white px-3 py-1 rounded mr-2"
            >
              <Check size={16} /> Simpan
            </button>
          )}
          <button onClick={cancelEditOrAdd} className="text-slate-500">
            <X size={16} /> {editingTemplateId ? "Batal Edit" : "Batal Tambah"}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-500 text-white px-3 py-1 rounded mb-4"
        >
          <PlusCircle size={16} /> Tambah Template
        </button>
      )}

      <ul>
        {templates.map((template) => (
          <li
            key={template.id}
            className="flex justify-between items-center p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded group"
          >
            {editingTemplateId === template.id ? (
              <span className="text-slate-500 italic">Sedang diedit...</span>
            ) : (
              <span
                onClick={() => onSelectTemplate(template.template)}
                className="cursor-pointer flex-1 truncate pr-2"
                title={template.template}
              >
                {template.name}
              </span>
            )}
            <div
              className={`flex items-center space-x-1 ${
                editingTemplateId === template.id
                  ? "opacity-50"
                  : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
              }`}
            >
              <button
                onClick={() => handleEditTemplate(template)}
                className="text-blue-500 hover:text-blue-700 p-1"
                disabled={editingTemplateId === template.id}
              >
                <FilePenLine size={16} />
              </button>
              <button
                onClick={() => onDeleteTemplate(template.id)}
                className="text-red-500 hover:text-red-700 p-1"
                disabled={editingTemplateId === template.id}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
