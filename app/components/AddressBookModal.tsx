import React from "react";

interface AddressBookModalProps {
  isOpen: boolean;
  groupNameInput: string;
  setGroupNameInput: (val: string) => void;
  saveCurrentGroup: () => void;
  addressGroups: { id: string; name: string; content: string }[];
  loadGroupToRows: (content: string) => void;
  deleteGroup: (id: string) => void;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
  setShowAddressBook: (val: boolean) => void;
}

export default function AddressBookModal({
  isOpen,
  groupNameInput,
  setGroupNameInput,
  saveCurrentGroup,
  addressGroups,
  loadGroupToRows,
  deleteGroup,
  addToast,
  setShowAddressBook
}: AddressBookModalProps) {
  if (!isOpen) return null;

  return (
    <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Smart Contacts</h3>
        <span className="text-[10px] text-slate-500">Save & load recipient groups</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Group Name (e.g. Core Team Payroll)"
          value={groupNameInput}
          onChange={(e) => setGroupNameInput(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500"
        />
        <button
          onClick={saveCurrentGroup}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
        >
          Save Current
        </button>
      </div>

      {addressGroups.length === 0 ? (
        <p className="text-xs text-slate-500 italic text-center py-2">No saved groups yet.</p>
      ) : (
        <div className="grid gap-2 max-h-40 overflow-y-auto pr-1">
          {addressGroups.map((g) => (
            <div key={g.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div>
                <span className="font-bold text-slate-200">{g.name}</span>
                <span className="text-slate-500 ml-2">({g.content.split("\n").length - 1} recipients)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { loadGroupToRows(g.content); addToast(`Loaded group: ${g.name}`, "success"); setShowAddressBook(false); }}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Load
                </button>
                <button
                  onClick={() => deleteGroup(g.id)}
                  className="text-rose-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}