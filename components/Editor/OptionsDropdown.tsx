"use client";

import * as Popover from "@radix-ui/react-popover";
import * as Switch from "@radix-ui/react-switch";
import { Clock, Lock, Eye } from "lucide-react";
import { useCallback } from "react";

interface OptionsDropdownProps {
  password: string;
  expirationTime: string;
  expireAfterViewing: boolean;
  onPasswordChange: (value: string) => void;
  onExpirationChange: (value: string) => void;
  onToggleExpireAfterViewing: () => void;
}

export default function OptionsDropdown({
  password,
  expirationTime,
  expireAfterViewing,
  onPasswordChange,
  onExpirationChange,
  onToggleExpireAfterViewing,
}: OptionsDropdownProps) {
  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onPasswordChange(e.target.value),
    [onPasswordChange],
  );

  const handleExpirationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onExpirationChange(e.target.value),
    [onExpirationChange],
  );

  return (
    <Popover.Content
      className="z-50 w-64 space-y-4 border border-zinc-800 bg-zinc-900 p-4 outline-none"
      sideOffset={8}
      align="end"
    >
      <div>
        <label className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
          <Lock className="h-3 w-3" />
          password
        </label>
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          className="w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
          placeholder="optional"
        />
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
          <Clock className="h-3 w-3" />
          expires at
        </label>
        <input
          type="datetime-local"
          value={expirationTime}
          onChange={handleExpirationChange}
          className="w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 [color-scheme:dark] focus:border-zinc-600 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
          <Eye className="h-3 w-3" />
          burn after reading
        </label>
        <Switch.Root
          checked={expireAfterViewing}
          onCheckedChange={onToggleExpireAfterViewing}
          className="h-4 w-8 border border-zinc-700 transition-colors data-[state=checked]:border-zinc-500 data-[state=checked]:bg-zinc-800"
        >
          <Switch.Thumb className="block h-3 w-3 translate-x-0.5 bg-zinc-400 transition-transform duration-200 will-change-transform data-[state=checked]:translate-x-[18px]" />
        </Switch.Root>
      </div>
    </Popover.Content>
  );
}
