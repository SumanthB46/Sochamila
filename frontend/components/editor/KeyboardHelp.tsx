"use client";

import { X } from "lucide-react";
import { EDITOR_SHORTCUTS, KeyboardShortcuts } from "./editorUtils";

interface KeyboardHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardHelp({ isOpen, onClose }: KeyboardHelpProps) {
  if (!isOpen) return null;

  const shortcuts = Object.entries(EDITOR_SHORTCUTS) as [string, string][];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>⌨️</span> Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-teal-100 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="p-6 space-y-4">
          {shortcuts.map(([key, action]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm text-gray-700">{action}</span>
              <kbd className="px-2.5 py-1.5 text-xs font-mono font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <p className="text-xs text-gray-600 text-center">
             Pro tip: Learn these shortcuts to design faster!
          </p>
        </div>
      </div>
    </div>
  );
}
