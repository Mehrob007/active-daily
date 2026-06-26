import React, { useCallback, useState } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  value?: File | string | null;
  onChange: (file: File | null) => void;
  label?: string;
  placeholderImage?: string;
  className?: string;
}

export function FileUploader({
  value,
  onChange,
  label,
  placeholderImage,
  className,
}: FileUploaderProps) {
  const [preview, setPreview] = useState<string | null>(() => {
    if (typeof value === 'string') return value;
    if (value instanceof File) return URL.createObjectURL(value);
    return null;
  });
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  }, [onChange]);
  
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(null);
    setPreview(null);
  }, [onChange]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <span className="text-sm font-medium">{label}</span>}
      <label
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
          preview || placeholderImage ? "border-primary/50" : "border-muted-foreground/25"
        )}
      >
        <input 
          type="file" 
          className="hidden" 
          accept="image/*,.pdf" 
          onChange={handleFileChange} 
        />
        
        {(preview || placeholderImage) ? (
          <div className="absolute inset-0 w-full h-full p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={preview || placeholderImage} 
              alt="Preview" 
              className="w-full h-full object-contain rounded-md" 
            />
            {preview && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 w-6 h-6 rounded-full opacity-80 hover:opacity-100"
                onClick={handleClear}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
            <UploadCloud className="w-8 h-8 mb-3" />
            <p className="text-xs font-semibold text-center px-4">
              Нажмите или перетащите файл
            </p>
          </div>
        )}
      </label>
    </div>
  );
}
