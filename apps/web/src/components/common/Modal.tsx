"use client";
import React from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

const sizeToClass: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, size = "md", children, footer, className }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`relative z-10 w-[95%] ${sizeToClass[size]} max-h-[calc(100vh-2rem)] rounded-2xl border border-neutral-200 bg-white p-2 sm:p-3 text-neutral-900 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 ${className || ""}`}
      >
        {title ? <div className="mb-1 text-sm sm:text-base font-semibold">{title}</div> : null}
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
          {children}
        </div>
        {footer ? <div className="mt-2 flex flex-col sm:flex-row gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

export default Modal;

