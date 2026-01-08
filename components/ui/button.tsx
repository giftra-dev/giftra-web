import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
}

export function Button({
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50",
        variant === "default" && "bg-black text-white hover:bg-gray-800",
        variant === "outline" &&
          "border border-gray-300 hover:bg-gray-100",
        className
      )}
      {...props}
    />
  )
}
