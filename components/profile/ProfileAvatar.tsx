"use client";

import { useState } from "react";
import { Camera, X } from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Button } from "@/components/ui/button";

interface ProfileAvatarProps {
  name: string;
  avatarUrl?: string;
  onAvatarChange?: (file: File) => void;
}

export function ProfileAvatar({ name, avatarUrl, onAvatarChange }: ProfileAvatarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, выберите изображение");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Размер файла не должен превышать 5 МБ");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      onAvatarChange?.(file);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onAvatarChange?.(new File([""], ""));
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <AvatarImage
          src={preview || avatarUrl || "/demo/people/maria.jpg"}
          name={name}
          size={128}
          className="size-32 rounded-full object-cover ring-4 ring-white shadow-lg"
        />
        {isEditing && (
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 grid size-10 place-items-center rounded-full bg-[hsl(var(--accent))] text-white cursor-pointer hover:scale-105 transition-transform"
          >
            <Camera className="size-4" />
            <input
              id="avatar-upload"
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {isEditing ? (
          <>
            <Button variant="default" size="sm" onClick={() => onAvatarChange?.(new File([preview || ""], "avatar.jpg"))}>
              Сохранить
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
              Отмена
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Изменить фото
          </Button>
        )}
        {preview && (
          <Button variant="ghost" size="sm" onClick={handleRemove}>
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

import React from "react";