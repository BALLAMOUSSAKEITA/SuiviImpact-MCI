"use client";

import { BSD_MEMBER_TABS } from "@/lib/bsd-tabs";

interface BsdMemberTabsFieldProps {
  value: string[];
  onChange: (tabs: string[]) => void;
  error?: string;
}

export function BsdMemberTabsField({ value, onChange, error }: BsdMemberTabsFieldProps) {
  const selected = new Set(value);
  const allSelected = BSD_MEMBER_TABS.every((tab) => selected.has(tab.key));

  const toggle = (key: string) => {
    if (selected.has(key)) {
      onChange(value.filter((item) => item !== key));
      return;
    }
    onChange([...value, key]);
  };

  const toggleAll = () => {
    onChange(allSelected ? [] : BSD_MEMBER_TABS.map((tab) => tab.key));
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="label-grain">Onglets accessibles</label>
        <button
          type="button"
          className="text-xs font-medium text-forest-ink hover:underline"
          onClick={toggleAll}
        >
          {allSelected ? "Tout décocher" : "Tout cocher"}
        </button>
      </div>
      <p className="mb-3 text-xs text-slate">
        Cochez les modules auxquels ce membre du BSD pourra accéder. Le profil reste toujours
        disponible.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {BSD_MEMBER_TABS.map((tab) => {
          const checked = selected.has(tab.key);
          return (
            <label
              key={tab.key}
              className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-hairline bg-white px-3 py-2 text-sm text-graphite hover:bg-veil"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#0d4f38]"
                checked={checked}
                onChange={() => toggle(tab.key)}
              />
              {tab.label}
            </label>
          );
        })}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
